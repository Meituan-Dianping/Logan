import {convertRgbToRgba} from "./color";


describe("Color Module", () => {
  describe("convertRgbToRgba function", () => {
    it("should process 3-character dash notation properly", () => {
      const expected = "rgba(255,255,255,0)";
      const actual = convertRgbToRgba("#fff", 0);
      expect(actual).toBe(expected);
    });

    it("should process 6-character dash notation properly", () => {
      const expected = "rgba(255,255,255,0)";
      const actual = convertRgbToRgba("#ffffff", 0);
      expect(actual).toBe(expected);
    });
  })
})


