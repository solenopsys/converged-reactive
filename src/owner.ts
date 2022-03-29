
/* IMPORT */

import Observable from './observable';
import Observer from './observer';
import Root from './root';
import {CleanupFunction, ObserverPublic, OwnerFunction, ErrorFunction} from './types';

/* HELPERS */

let owner: Observer | undefined = undefined;
let isSampling = false;

/* MAIN */

const Owner = {

  /* REGISTRATION API */

  registerCleanup: ( cleanup: CleanupFunction ): void => {

    owner?.registerCleanup ( cleanup );

  },

  registerError: ( error: ErrorFunction ): void => {

    owner?.registerError ( error );

  },

  registerObservable: ( observable: Observable ): void => {

    if ( !owner ) return;

    if ( isSampling ) return;

    if ( owner instanceof Root ) return;

    const gotRegistered = observable.registerObserver ( owner );

    if ( !gotRegistered ) return;

    owner.registerObservable ( observable );

  },

  registerObservables: ( observables: Observable[] ): void => {

    if ( !owner ) return;

    if ( isSampling ) return;

    for ( let i = 0, l = observables.length; i < l; i++ ) {

      const observable = observables[i];
      const gotRegistered = observable.registerObserver ( owner );

      if ( !gotRegistered ) continue;

      owner.registerObservable ( observable );

    }

  },

  registerObserver: ( observer: Observer ): void => {

    owner?.registerObserver ( observer );

  },

  /* WRAPPING API */

  wrapWith: <T> ( fn: OwnerFunction<T>, observer?: Observer, disposable?: boolean, sampling?: boolean ): T => {

    const ownerPrev = owner;
    const samplingPrev = isSampling;

    owner = observer;
    isSampling = !!sampling;

    try {

      if ( observer && disposable ) {

        const dispose = Owner.dispose.bind ( undefined, observer );

        return fn ( dispose );

      } else {

        return ( fn as any )(); //TSC

      }

    } finally {

      owner = ownerPrev;
      isSampling = samplingPrev;

    }

  },

  wrapWithSampling: <T> ( fn: OwnerFunction<T> ): T => {

    return Owner.wrapWith ( fn, owner, false, true );

  },

  /* API */

  dispose: ( observer: Observer ): void => {

    //TODO: Maybe throw if disposing a root different from the current one, or implement this properly, setting the _current_ observer to undefined is a mistake

    observer.dispose ();

    owner = undefined;

  },

  get: (): Observer | undefined => {

    return owner;

  },

  getPublic: (): ObserverPublic | undefined => {

    return owner;

  }

};

/* EXPORT */

export default Owner;
