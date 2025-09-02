'use server';

import { CreateSegmentUsecase } from '@/application/campaign/CreateSegmentUsecase';
import { TargetSegmentRepositorySupabase } from '@/infrastructure/campaign/repositories/TargetSegmentRepositorySupabase';
import { LineUserRepositorySupabase } from '@/infrastructure/campaign/repositories/LineUserRepositorySupabase';
import { revalidatePath } from 'next/cache';

export async function createSegment(formData: FormData) {
  try {
    const accountId = formData.get('accountId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const criteriaJson = formData.get('criteria') as string;

    if (!accountId) {
      throw new Error('Account ID is required');
    }
    
    if (!name) {
      throw new Error('Segment name is required');
    }

    // 条件をパース
    let criteria;
    if (criteriaJson) {
      try {
        criteria = JSON.parse(criteriaJson);
      } catch (parseError) {
        throw new Error('Invalid criteria data');
      }
    }

    const segmentRepository = new TargetSegmentRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();
    
    const usecase = new CreateSegmentUsecase(segmentRepository, userRepository);

    const result = await usecase.execute({
      accountId,
      name,
      description,
      criteria,
    });

    revalidatePath('/dashboard/segments');
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getSegments(accountId: string) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const repository = new TargetSegmentRepositorySupabase();
    const segments = await repository.findByAccountId(accountId);

    return {
      success: true,
      data: segments.map(segment => ({
        id: segment.id,
        name: segment.name,
        description: segment.description,
        criteria: segment.criteria,
        estimatedCount: segment.estimatedCount,
        usageCount: segment.usageCount,
        type: segment.getSegmentType(),
        createdAt: segment.createdAt.toISOString(),
        updatedAt: segment.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getSegmentById(segmentId: string) {
  try {
    if (!segmentId) {
      throw new Error('Segment ID is required');
    }

    const repository = new TargetSegmentRepositorySupabase();
    const segment = await repository.findById(segmentId);

    if (!segment) {
      throw new Error('Segment not found');
    }

    return {
      success: true,
      data: {
        id: segment.id,
        accountId: segment.accountId,
        name: segment.name,
        description: segment.description,
        criteria: segment.criteria,
        estimatedCount: segment.estimatedCount,
        usageCount: segment.usageCount,
        type: segment.getSegmentType(),
        createdAt: segment.createdAt.toISOString(),
        updatedAt: segment.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateSegment(segmentId: string, formData: FormData) {
  try {
    if (!segmentId) {
      throw new Error('Segment ID is required');
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const criteriaJson = formData.get('criteria') as string;

    if (!name) {
      throw new Error('Segment name is required');
    }

    // 条件をパース
    let criteria;
    if (criteriaJson) {
      try {
        criteria = JSON.parse(criteriaJson);
      } catch (parseError) {
        throw new Error('Invalid criteria data');
      }
    }

    const segmentRepository = new TargetSegmentRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();
    
    const segment = await segmentRepository.findById(segmentId);
    if (!segment) {
      throw new Error('Segment not found');
    }

    const updatedSegment = segment.updateBasicInfo(name, description);
    const segmentWithCriteria = updatedSegment.updateCriteria(criteria);

    // 対象者数を再計算
    const estimatedCount = await userRepository.countByCriteria(segment.accountId, criteria);
    const finalSegment = segmentWithCriteria.updateEstimatedCount(estimatedCount);

    await segmentRepository.save(finalSegment);

    revalidatePath('/dashboard/segments');
    revalidatePath(`/dashboard/segments/${segmentId}`);
    
    return {
      success: true,
      data: {
        id: finalSegment.id,
        name: finalSegment.name,
        description: finalSegment.description,
        estimatedCount: finalSegment.estimatedCount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteSegment(segmentId: string) {
  try {
    if (!segmentId) {
      throw new Error('Segment ID is required');
    }

    const repository = new TargetSegmentRepositorySupabase();
    const segment = await repository.findById(segmentId);

    if (!segment) {
      throw new Error('Segment not found');
    }

    await repository.delete(segmentId);

    revalidatePath('/dashboard/segments');
    
    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function duplicateSegment(segmentId: string) {
  try {
    if (!segmentId) {
      throw new Error('Segment ID is required');
    }

    const segmentRepository = new TargetSegmentRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();
    
    const originalSegment = await segmentRepository.findById(segmentId);
    if (!originalSegment) {
      throw new Error('Segment not found');
    }

    const usecase = new CreateSegmentUsecase(segmentRepository, userRepository);

    const result = await usecase.execute({
      accountId: originalSegment.accountId,
      name: `${originalSegment.name} (コピー)`,
      description: originalSegment.description,
      criteria: originalSegment.criteria,
    });

    revalidatePath('/dashboard/segments');
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function previewSegment(criteriaJson: string, accountId: string) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    // 条件をパース
    let criteria;
    if (criteriaJson) {
      try {
        criteria = JSON.parse(criteriaJson);
      } catch (parseError) {
        throw new Error('Invalid criteria data');
      }
    }

    const userRepository = new LineUserRepositorySupabase();
    
    // 条件に一致するユーザー数を取得
    const estimatedCount = await userRepository.countByCriteria(accountId, criteria);
    
    // サンプルユーザーを取得（最大10件）
    const sampleUsers = await userRepository.findByCriteria(accountId, criteria);
    const limitedSampleUsers = sampleUsers.slice(0, 10);

    return {
      success: true,
      data: {
        estimatedCount,
        sampleUsers: limitedSampleUsers.map(user => ({
          id: user.id,
          displayName: user.displayName,
          gender: user.gender,
          age: user.age,
          region: user.region,
        })),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getSegmentStatistics(accountId: string) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const segmentRepository = new TargetSegmentRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();
    
    const [segments, userStats] = await Promise.all([
      segmentRepository.findByAccountId(accountId),
      userRepository.getStatistics(accountId),
    ]);

    const totalSegments = segments.length;
    const totalEstimatedUsers = segments.reduce((sum, segment) => sum + (segment.estimatedCount || 0), 0);
    const averageSegmentSize = totalSegments > 0 ? Math.round(totalEstimatedUsers / totalSegments) : 0;
    
    // セグメントタイプ別の分布
    const segmentTypeDistribution = segments.reduce((acc, segment) => {
      const type = segment.getSegmentType();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        totalSegments,
        totalEstimatedUsers,
        averageSegmentSize,
        segmentTypeDistribution,
        userStatistics: userStats,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}