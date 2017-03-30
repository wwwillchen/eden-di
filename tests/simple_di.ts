import {createInjector, Inject, Module, Provides} from '../src/';

describe('Simple di setup', () => {
  it('Nothing blows up', () => {
    expect(1).toEqual(1);

    class Engine {}

    @Inject
    class Car {
      constructor(public engine: Engine) {}
    }

    const injector = createInjector([Engine, Car]);
    const car = injector.get(Car);

    expect(car.engine).toEqual(expect.any(Engine));

  });

  it('Multiple dependencies', () => {
    class Engine {}
    class Windshield {}

    @Inject
    class Car {
      constructor(public engine: Engine, public windshield: Windshield) {}
    }

    const injector = createInjector([Engine, Windshield, Car]);
    const car = injector.get(Car);

    expect(car.engine).toEqual(expect.any(Engine));
    expect(car.windshield).toEqual(expect.any(Windshield));
  });

  it('Nested dependencies', () => {
    class Wires {}

    @Inject
    class Engine {
      constructor(public wires: Wires) {}
    }

    @Inject
    class Car {
      constructor(public engine: Engine) {}
    }

    const injector = createInjector([Engine, Wires, Car]);
    const car = injector.get(Car);

    expect(car.engine).toEqual(expect.any(Engine));
    expect(car.engine.wires).toEqual(expect.any(Wires));
  });
});

describe('Abstract dependencies', () => {
  it('Abstract class', () => {
    abstract class EngineInterface { abstract run(): void; }

    class GasEngine implements EngineInterface {
      run() {
        // gas-powered
      }
    }

    @Module
    class EngineModule {
      @Provides
      engine(a: string): EngineInterface {
        return new GasEngine();
      }
    }

    @Inject
    class Car {
      constructor(public engine: EngineInterface) {}
    }

    const injector = createInjector([EngineModule, Car]);
    const car = injector.get(Car);

    expect(car.engine).toEqual(expect.any(GasEngine));
  });

  it.skip('interface - this should actually fail', () => {
    interface EngineInterface {
      run(): void;
    }

    class GasEngine implements EngineInterface {
      run() {
        // gas-powered
      }
    }

    @Module
    class EngineModule {
      @Provides
      engine(a: string): EngineInterface {
        return new GasEngine();
      }
    }

    @Inject
    class Car {
      constructor(public engine: EngineInterface) {}
    }

    const injector = createInjector([EngineModule, Car]);
    const car = injector.get(Car);

    expect(car.engine).toEqual(expect.any(GasEngine));
  });
});

/**
 *
 * @Module({
 *   engine(a: Wires): EngineInterface {
 *     return new GasEngine;
 *   }
 * })
   class EngineModule {
      @Provides
      engine(a: string): EngineInterface {
        return new GasEngine();
      }
    }
 *
 * @Injector(configs=[EngineModule, Car])
 * abstract class AppInjector {
 * }
 *
 * Eden_AppInjector
 */

// interface Hello {
//   hi(): void;
// }

// abstract class EngineType implements Hello { abstract hi(): void; }