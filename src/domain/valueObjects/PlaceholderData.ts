export class PlaceholderData {
  readonly #data: Map<string, string>;

  private constructor(data: Map<string, string>) {
    this.#data = new Map(data);
    Object.freeze(this);
  }

  static create(data: Record<string, string>): PlaceholderData {
    const dataMap = new Map<string, string>();
    
    for (const [key, value] of Object.entries(data)) {
      if (!key || key.trim().length === 0) {
        throw new Error('Placeholder key cannot be empty');
      }
      if (value === null || value === undefined) {
        throw new Error(`Placeholder value for key '${key}' cannot be null or undefined`);
      }
      
      const trimmedKey = key.trim();
      const trimmedValue = String(value).trim();
      
      if (!this.isValidPlaceholderKey(trimmedKey)) {
        throw new Error(`Invalid placeholder key '${trimmedKey}'. Must contain only letters, numbers, and underscores.`);
      }
      
      dataMap.set(trimmedKey, trimmedValue);
    }

    return new PlaceholderData(dataMap);
  }

  static createEmpty(): PlaceholderData {
    return new PlaceholderData(new Map());
  }

  static reconstruct(data: Record<string, string>): PlaceholderData {
    const dataMap = new Map(Object.entries(data));
    return new PlaceholderData(dataMap);
  }

  private static isValidPlaceholderKey(key: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
  }

  get(key: string): string | undefined {
    return this.#data.get(key);
  }

  has(key: string): boolean {
    return this.#data.has(key);
  }

  get keys(): string[] {
    return Array.from(this.#data.keys());
  }

  get values(): string[] {
    return Array.from(this.#data.values());
  }

  get size(): number {
    return this.#data.size;
  }

  isEmpty(): boolean {
    return this.#data.size === 0;
  }

  set(key: string, value: string): PlaceholderData {
    if (!key || key.trim().length === 0) {
      throw new Error('Placeholder key cannot be empty');
    }
    if (!PlaceholderData.isValidPlaceholderKey(key.trim())) {
      throw new Error(`Invalid placeholder key '${key.trim()}'. Must contain only letters, numbers, and underscores.`);
    }

    const newData = new Map(this.#data);
    newData.set(key.trim(), String(value).trim());
    
    return new PlaceholderData(newData);
  }

  merge(other: PlaceholderData): PlaceholderData {
    const newData = new Map(this.#data);
    
    for (const [key, value] of other.#data) {
      newData.set(key, value);
    }
    
    return new PlaceholderData(newData);
  }

  equals(other: PlaceholderData): boolean {
    if (this.#data.size !== other.#data.size) {
      return false;
    }

    for (const [key, value] of this.#data) {
      if (other.#data.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  toString(): string {
    const entries = Array.from(this.#data.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
    
    return `{${entries}}`;
  }

  toRecord(): Record<string, string> {
    return Object.fromEntries(this.#data);
  }

  toJSON(): any {
    return this.toRecord();
  }

  /**
   * テンプレート文字列内のプレースホルダーを実際の値に置換します
   * プレースホルダーの形式: {{key}}
   */
  applyToTemplate(template: string): string {
    let result = template;
    
    for (const [key, value] of this.#data) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    return result;
  }

  /**
   * テンプレート文字列から使用されているプレースホルダーキーを抽出します
   */
  static extractPlaceholderKeys(template: string): string[] {
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const keys: string[] = [];
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
      const key = match[1];
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * テンプレート文字列で使用されているが、このプレースホルダーデータに含まれていないキーを返します
   */
  getMissingKeysForTemplate(template: string): string[] {
    const requiredKeys = PlaceholderData.extractPlaceholderKeys(template);
    return requiredKeys.filter(key => !this.has(key));
  }
}