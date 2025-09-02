// Base Specification
export { type MessageSpecification } from './MessageSpecification';
export { CompositeSpecification, AndSpecification, OrSpecification, NotSpecification } from './CompositeSpecification';

// Concrete Specifications
export { KeywordSpecification } from './KeywordSpecification';
export { RegexSpecification } from './RegexSpecification';
export { TimeWindowSpecification } from './TimeWindowSpecification';
export { MessageTypeSpecification } from './MessageTypeSpecification';

// Re-export types from entities for convenience
export { KeywordMatchMode } from '../entities/Condition';
export { MessageType } from '../entities/IncomingMessage';