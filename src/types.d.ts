export {} // marks this file as a module so `declare global` is legal

declare global {
  namespace MyUtil {
    /**
     * A comparator function for use with Array.prototype.sort.
     */
    type Comparator<T = unknown> = (a: T, b: T) => number

    /**
     * Derives a value from an array element.
     */
    type Mapper<T = unknown, R = unknown> = (element: T, index: number, array: T[]) => R

    /**
     * Derives a value from an object's property.
     */
    type ObjectMapper<T = unknown, R = unknown> = (value: T, key: string, object: Object) => R

    /**
     * A valid argument for ordering comparison operators: <, >, <=, >=
     */
    type Comparable = number | string | bigint | boolean | Date
  }
}
