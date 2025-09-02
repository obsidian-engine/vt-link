import { AutoReplyRuleV2 } from '../entities/AutoReplyRuleV2';
import { KeywordSpecification } from '../specifications/KeywordSpecification';
import { TextReplyCommand } from '../commands/TextReplyCommand';
import { IncomingMessage } from '../entities/IncomingMessage';

describe('AutoReplyRuleV2', () => {
  describe('create', () => {
    it('should create a new rule with valid parameters', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      const rule = AutoReplyRuleV2.create(
        'rule-1',
        'account-1', 
        'Test Rule',
        1,
        trigger,
        response
      );

      expect(rule.id).toBe('rule-1');
      expect(rule.accountId).toBe('account-1');
      expect(rule.name).toBe('Test Rule');
      expect(rule.priority).toBe(1);
      expect(rule.enabled).toBe(true);
    });

    it('should throw error when name is empty', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      expect(() => {
        AutoReplyRuleV2.create(
          'rule-1',
          'account-1',
          '',
          1,
          trigger,
          response
        );
      }).toThrow('Rule name is required');
    });

    it('should throw error when priority is negative', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      expect(() => {
        AutoReplyRuleV2.create(
          'rule-1',
          'account-1',
          'Test Rule',
          -1,
          trigger,
          response
        );
      }).toThrow('Priority must be non-negative');
    });
  });

  describe('handleMessage', () => {
    it('should return false when rule is disabled', async () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      const rule = AutoReplyRuleV2.create(
        'rule-1',
        'account-1',
        'Test Rule',
        1,
        trigger,
        response,
        null,
        false // disabled
      );

      const message = new IncomingMessage(
        'msg-1',
        'user-1',
        'text',
        'hello',
        'reply-token',
        new Date()
      );

      const result = await rule.handleMessage(message);
      expect(result).toBe(false);
    });
  });

  describe('updateName', () => {
    it('should create new instance with updated name', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      const rule = AutoReplyRuleV2.create(
        'rule-1',
        'account-1',
        'Old Name',
        1,
        trigger,
        response
      );

      const updatedRule = rule.updateName('New Name');
      
      expect(updatedRule.name).toBe('New Name');
      expect(rule.name).toBe('Old Name'); // original unchanged
      expect(updatedRule.id).toBe(rule.id);
    });

    it('should throw error when new name is empty', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      const rule = AutoReplyRuleV2.create(
        'rule-1',
        'account-1',
        'Test Rule',
        1,
        trigger,
        response
      );

      expect(() => {
        rule.updateName('');
      }).toThrow('Rule name is required');
    });
  });

  describe('enable/disable', () => {
    it('should toggle enabled state', () => {
      const trigger = new KeywordSpecification(['hello'], 'exact');
      const response = new TextReplyCommand('Hello!');
      
      const rule = AutoReplyRuleV2.create(
        'rule-1',
        'account-1',
        'Test Rule',
        1,
        trigger,
        response,
        null,
        true
      );

      const disabledRule = rule.disable();
      expect(disabledRule.enabled).toBe(false);
      expect(rule.enabled).toBe(true); // original unchanged

      const enabledRule = disabledRule.enable();
      expect(enabledRule.enabled).toBe(true);
      expect(disabledRule.enabled).toBe(false); // previous unchanged
    });
  });
});