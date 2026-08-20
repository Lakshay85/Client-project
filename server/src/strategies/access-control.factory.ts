import { AccessType } from '../types/index.js';
import {
  AccessControlStrategy,
  AllowAllStrategy,
  WhitelistStrategy,
  BlacklistStrategy,
} from './access-control.strategy.js';

/**
 * Factory Method for creating the appropriate AccessControlStrategy.
 *
 * @pattern Factory Method (GoF Creational)
 */
export class AccessControlFactory {
  private static readonly strategies: Record<AccessType, AccessControlStrategy> = {
    allow_all: new AllowAllStrategy(),
    allow_only: new WhitelistStrategy(),
    restrict_specific: new BlacklistStrategy(),
  };

  /**
   * Returns the strategy instance for the given access type.
   * Defaults to AllowAllStrategy for unrecognized types.
   */
  static create(accessType: string): AccessControlStrategy {
    return (
      this.strategies[accessType as AccessType] ??
      this.strategies.allow_all
    );
  }
}
