import {nativeLogTypeConfigs, webLogTypeConfigs} from "../consts/logtypes";

export const convertBriefsToMinimapBriefs = (briefs, type) => {
  let ret = [];
  const LogTypeRules = type === "native" ? nativeLogTypeConfigs : webLogTypeConfigs;
  for (let brief of briefs) {
    let logType = LogTypeRules.find(rule => rule.logType === brief.logType);
    if (logType === undefined) {
      logType = {
        logType: 0,
        logTypeName: "未知日志",
        displayColor: "#000000"
      };
    }

    if (type === "native") {
      ret.push({
        id: brief.id,
        time: brief.logTime,
        logType: {
          type: logType.logType,
          logTypeName: logType.logTypeName,
          displayColor: logType.displayColor
        }
      });
    } else {
      ret.push({
        id: brief.detailId,
        time: brief.logTime,
        logType: {
          type: logType.logType,
          logTypeName: logType.logTypeName,
          displayColor: logType.displayColor
        }
      })
    }


  }
  return ret;
};

export const convertBriefsToLoglistInfiniteScrollBriefs = (briefs, type) => {
  if (type === "native") {
    return briefs;
  } else {
    return briefs.map(item => ({
      id: item.detailId,
      logTime: item.logTime,
      logType: item.logType
    }))
  }
};

