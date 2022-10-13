import { Observable } from "rxjs";

export function myOperator(delayTime: number) {
  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable<T>(subscriber => {
      let queue: T[] | undefined;
      let isSourceCompleted: boolean = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      function output(value: T) {
        if (!queue?.length) {
          subscriber.next(value);
          clearInterval(timeout);
          timeout = undefined;
        }
        else {
          subscriber.next(value);
          let tmp = queue[0];
          queue.splice(0, 1);
          setTimeout(() => {
            output(tmp);
          }, delayTime);
        }
        if (isSourceCompleted && !queue?.length) {
          setTimeout(() => {
            subscriber.complete();
          }, delayTime);
        }
      }

      const sourceSubscription = source.subscribe({
        complete: () => {
          console.log("Source subscription completed.");
          isSourceCompleted = true;
        },
        error: (e) => subscriber.error(e),
        next: (data) => {
          console.log(`myOperator: proceeded - ${data}`);
          if (timeout === undefined) {
            queue = [];
            timeout = setTimeout(() => {
              output(data);
            }, delayTime);
          }
          else {
            if (timeout !== undefined) {
              queue?.push(data);
            }
          }
        },
      });

      return () => {
        clearTimeout(timeout);
        sourceSubscription.unsubscribe();
      };
    });
  };
}
