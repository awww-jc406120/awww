import { expect } from "chai";
import "mocha";

function fib(n)
{
    if (n == 0) return 0;
    if (n <= 2) return 1;
    return fib(n-1) + fib(n-2);
}

describe("Fibonacci", () => {
    it("should equal 0 for call with 0", () => {
        expect(fib(0)).to.equal(0);
    });
    it("should equal 1 for call with 1", () => {
        expect(fib(1)).to.equal(1);
    });
    it("should equal 1 for call with 1", () => {
        expect(fib(2)).to.equal(1);
    });
    it("should equal 2 for call with 2", () => {
        expect(fib(3)).to.equal(2);
    });
    it("should equal 3 for call with 3", () => {
        expect(fib(4)).to.equal(3);
    });
    it("should equal 5 for call with 5", () => {
        expect(fib(5)).to.equal(5);
    });

});
