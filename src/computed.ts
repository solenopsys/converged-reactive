
/* IMPORT */

import ObservableClass from './observable';
import Observer from './observer';
import Owner from './owner';
import readable from './readable';
import {isUndefined} from './utils';
import {ComputedFunction, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableOptions} from './types';

/* MAIN */

class Computed<T, TI> extends Observer {

  /* VARIABLES */

  private fn: ComputedFunction<T, TI>;
  private observable: ObservableClass<T | TI>;

  /* CONSTRUCTOR */

  constructor ( fn: ComputedFunction<T, TI>, valueInitial?: T | TI, options?: ObservableOptions<T, T | TI> ) {

    super ();

    this.fn = fn;
    this.observable = new ObservableClass ( valueInitial, options, this ) as ObservableClass<T | TI>; //TSC

    this.update ();

  }

  /* API */

  update (): void {

    Owner.registerObserver ( this );

    if ( !isUndefined ( this.dirty ) ) { // Skipping unusbscription during the first execution

      Observer.unsubscribe ( this );

    }

    this.dirty = false;

    const valuePrev = this.observable.value;

    try {

      const valueNext: T = Owner.wrapWith ( this.fn.bind ( undefined, valuePrev ), this );

      this.observable.set ( valueNext );

    } catch ( error: unknown ) {

      this.updateError ( error );

    }

  }

  /* STATIC API */

  static wrap <T> ( fn: ComputedFunction<T, T | undefined> ): ObservableReadonlyWithoutInitial<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableReadonlyWithoutInitial<T>;
  static wrap <T> ( fn: ComputedFunction<T, T>, value: T, options?: ObservableOptions<T, T> ): ObservableReadonly<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value?: T, options?: ObservableOptions<T, T | undefined> ) {

    return readable ( new Computed ( fn, value, options ).observable );

  }

}

/* EXPORT */

export default Computed;
