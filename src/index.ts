// Note: need to import reflect-metadata package once in the project to polyfill
// the ES6 reflection API
import 'reflect-metadata';

/**
 * @Inject annotates that a class will have its dependencies (i.e.
 * constructor parameters) injected into it when its instantiated
 * by the framework.
 */
export function Inject<T extends{new (...args: any[]): {}}>(target: T) {}


export function Module<T extends{new (...args: any[]): {}}>(target: T) {
  Reflect.defineMetadata(MetadataDIKeys.Module, true, target);
}

/**
 * @Provider annotates that a function will show how to instantiate
 * a particular type
 */
export function Provides<T>(
    target: Object, propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>) {}


export function createInjector(providers: any[]) {
  return new Injector(providers);
}

type Module = any;
type Class = any;
type ModuleOrClass = Module|Class;

class Injector {
  private _typeToProvider: Map<any, any>;
  constructor(providers: ModuleOrClass[]) {
    this._init(providers);
  }

  get<T>(type: {new(...args: any[]): T;}): T {
    const provider = this._typeToProvider.get(type);
    return provider();
  }

  private _init(configs: ModuleOrClass[]) {
    this._typeToProvider = new Map();
    for (let config of configs) {
      if (Reflect.hasOwnMetadata(MetadataDIKeys.Module, config)) {
        this._processModule(config);
      } else {
        this._processClass(config);
      }
    }
  }

  private _processModule(config: Module) {
    for (let prop of Object.getOwnPropertyNames(config.prototype)) {
      if (prop === 'constructor') {
        continue;
      }
      let factoryFunction = config.prototype[prop];
      let providedType =
          Reflect.getMetadata(MetadataTypeKeys.ReturnType, new config(), prop);
      const provider = () => factoryFunction();
      this._typeToProvider.set(providedType, provider);
    }
  }

  private _processClass(userClass: Class) {
    let dependencies =
        Reflect.getMetadata(MetadataTypeKeys.ParameterType, userClass);
    let provider = () => {
      if (!dependencies) {
        return new userClass();
      }
      const resolvedDependencies =
          dependencies.map(dependency => this.get(dependency));
      return new userClass(...resolvedDependencies);
    };
    this._typeToProvider.set(userClass, provider);
  }
}

// Defined by Typescript
class MetadataTypeKeys {
  static Type = 'design:type';
  static ParameterType = 'design:paramtypes';
  static ReturnType = 'design:returntype';
}

// Defined by us
class MetadataDIKeys {
  static Module = Symbol('module');
}