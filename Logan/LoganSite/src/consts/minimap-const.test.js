import * as MinimapConst from "./minimap";

describe("Minimap Constants", () => {
  it("should match constants value", () => {
    const BLUE = "#1890ff";
    const GREY = "#8c8c8c";
    const BAR_TOP_MARGIN = 20;
    const BAR_BOTTOM_MARGIN = 20;
    const BAR_CSS_WIDTH = 30;
    const TIMETEXT_CSS_WIDTH = 8;
    const TIMETEXT_STYLE = "22px serif";

    expect(MinimapConst.BLUE).toBe(BLUE);
    expect(MinimapConst.GREY).toBe(GREY);
    expect(MinimapConst.BAR_BOTTOM_MARGIN).toBe(BAR_BOTTOM_MARGIN);
    expect(MinimapConst.BAR_CSS_WIDTH).toBe(BAR_CSS_WIDTH);
    expect(MinimapConst.BAR_TOP_MARGIN).toBe(BAR_TOP_MARGIN);
    expect(MinimapConst.TIMETEXT_CSS_WIDTH).toBe(TIMETEXT_CSS_WIDTH);
    expect(MinimapConst.TIMETEXT_STYLE).toBe(TIMETEXT_STYLE);
  })
});