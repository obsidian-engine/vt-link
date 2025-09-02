import { MessageSpecification } from './MessageSpecification';
import { IncomingMessage } from '../entities/IncomingMessage';

/**
 * 複数の条件を組み合わせるCompositeSpecification
 */
export abstract class CompositeSpecification implements MessageSpecification {
  abstract isSatisfiedBy(message: IncomingMessage): boolean;

  /**
   * AND条件で結合
   */
  and(other: MessageSpecification): MessageSpecification {
    return new AndSpecification(this, other);
  }

  /**
   * OR条件で結合
   */
  or(other: MessageSpecification): MessageSpecification {
    return new OrSpecification(this, other);
  }

  /**
   * NOT条件で否定
   */
  not(): MessageSpecification {
    return new NotSpecification(this);
  }
}

/**
 * AND条件Specification
 */
export class AndSpecification extends CompositeSpecification {
  constructor(
    private readonly left: MessageSpecification,
    private readonly right: MessageSpecification
  ) {
    super();
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    return this.left.isSatisfiedBy(message) && this.right.isSatisfiedBy(message);
  }
}

/**
 * OR条件Specification
 */
export class OrSpecification extends CompositeSpecification {
  constructor(
    private readonly left: MessageSpecification,
    private readonly right: MessageSpecification
  ) {
    super();
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    return this.left.isSatisfiedBy(message) || this.right.isSatisfiedBy(message);
  }
}

/**
 * NOT条件Specification
 */
export class NotSpecification extends CompositeSpecification {
  constructor(private readonly spec: MessageSpecification) {
    super();
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    return !this.spec.isSatisfiedBy(message);
  }
}