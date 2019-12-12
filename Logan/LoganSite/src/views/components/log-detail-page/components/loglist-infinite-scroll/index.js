import React, {Component} from "react";
import {Timeline, Divider, Spin, Icon} from "antd";
import {isEqual, findIndex} from "lodash";
import InfiniteScroll from "react-infinite-scroller";
import {LOG_MOVE_DISTANCE, LAST_LOAD_MIN_SPAN} from "./consts";
import {nativeLogTypeConfigs, webLogTypeConfigs} from "../../../../../consts/logtypes";
import {NUMBER_OF_LOG_IN_SINGLE_PAGE} from "../../../../../consts/pagination"
import moment from "moment";
import style from "./style.module.scss";

class LogListInfiniteScroll extends Component {
  constructor(props) {
    super(props);
    this.passiveSupported = false;
    this.lastUploadTime = Date.now();
    this.lastDownloadTime = Date.now();
    this.uploading = false;
    this.downloading = false;
    this.state = {
      mouseUpRolling: false,
      upHasMore: false,
      downHasMore: false
    };

    // test whether the target browser supports passive mode event
    try {
      const options = Object.defineProperty({}, "passive", {
        get() {
          this.passiveSupported = true;
          return this.passive;
        }
      });
      window.addEventListener("test", null, options);
    } catch (err) {}
  }

  componentDidMount() {
    document.addEventListener(
      "mousewheel",
      event => {
        if (event.wheelDelta > 0) {
          // 滚动向上
          if (!this.state.mouseUpRolling) {
            this.setState({mouseUpRolling: true});
          }
        } else {
          // 滚动向下
          if (this.state.mouseUpRolling) {
            this.setState({mouseUpRolling: false});
          }
        }
        this.updateHighLightIndex();
      },
      this.passiveSupported ? {passive: true} : false
    );
    this.updateHighLightIndex();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {data, briefs, focusLogId, rollingListManually} = this.props;
    if (data.length === 0 || briefs.length === 0) {
      return false;
    }

    const pageNum = Math.ceil(briefs.length / NUMBER_OF_LOG_IN_SINGLE_PAGE);

    // handle whether the focusLogId change is from close detail card
    // if it is from detail card, don't scroll
    if (prevProps.focusLogId !== focusLogId && focusLogId !== -1) {
      const focusLogIndex = this.calculateIndexOfLogList(focusLogId, data);
      rollingListManually(focusLogIndex);
    }
    this.updateHighLightIndex();

    // set loading options
    if (prevState.upHasMore === this.state.upHasMore && prevState.downHasMore === this.state.downHasMore) {
      if (pageNum <= 3) {
        this.setState({
          upHasMore: false,
          downHasMore: false
        })
      } else {
        if (data[data.length - 1].id === briefs[briefs.length - 1].id) {
          this.setState({
            downHasMore: false
          })
        } else {
          this.setState({
            downHasMore: true
          })
        }
        if (data[0].id === briefs[0].id) {
          this.setState({
            upHasMore: false
          })
        } else {
          this.setState({
            upHasMore: true
          })
        }
      }
    }
  }

  render() {
    const {data, focusLogId, type, updateFocusLogId} = this.props;
    const {upHasMore, downHasMore, mouseUpRolling} = this.state;
    return (
      <div className={style["inifinite-scroll-container"]}>
        <div className={style["container-inner"]} id="infinite-container-inner">
          {mouseUpRolling && !upHasMore && <Divider className="bottom-line">顶部</Divider>}
          {upHasMore && (
            <div className="log-uploading-top">
              <div className="log-uploading-trigger" onClick={() => {
                this.loadMore("up");
              }}>
                <Icon type="caret-up"/>
              </div>
            </div>
          )}

          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => {
              this.loadMore();
            }}
            hasMore={(mouseUpRolling && upHasMore) || (!mouseUpRolling && downHasMore)}
            useWindow={false}
            isReverse={mouseUpRolling}
            threshold={250}
            className={style["scroll-content"]}
          >
            <Timeline style={{marginTop: "20px"}}>
              {data.map((item, index) => (
                <TimelineItem
                  item={item}
                  index={index}
                  focusLogId={focusLogId}
                  type={type}
                  updateFocusLogId={updateFocusLogId}
                  key={`${item.id}-${index}`}
                />
              ))}
            </Timeline>
          </InfiniteScroll>

          {this.state.downloading && (
            <div className="demo-loading">
              <Spin/>
            </div>
          )}

          {!downHasMore && <Divider className="bottom-line">到底了</Divider>}
        </div>
      </div>
    );
  }

  loadMore = (direction, needFocus) => {
    const {briefs, data, rollingListManually, fetchTaskDetail} = this.props;
    const {upHasMore, downHasMore} = this.state;

    // decided direction of loading
    let isUp;
    if (direction === "up") {
      isUp = true;
    } else {
      isUp = this.state.mouseUpRolling;
    }

    // decided whether go to the end of current direction
    if (!((isUp && upHasMore) || ((!isUp) && downHasMore))) {
      return;
    }

    // throttle if
    if (
      (isUp && Date.now() - this.lastUploadTime > LAST_LOAD_MIN_SPAN && !this.state.uploading) ||
      (!isUp && Date.now() - this.lastDownloadTime > LAST_LOAD_MIN_SPAN && !this.state.downloading)
    ) {
      const pageSize = NUMBER_OF_LOG_IN_SINGLE_PAGE;
      const startIndex = findIndex(briefs, item => item.id === data[0].id);
      const endIndex = findIndex(briefs, item => item.id === data[data.length - 1].id);
      const startPageIndex = Math.floor(startIndex / pageSize);
      const endPageIndex = Math.floor((endIndex + 1) / pageSize);


      if (isUp) {
        this.setState({uploading: true});
        this.lastUploadTime = Date.now();
        const detailIds = briefs.slice((startPageIndex - 1) * pageSize, startPageIndex * pageSize).map(item => item.id);
        fetchTaskDetail(detailIds, "up")
          .then(() => {
            const highlightPairs = this.getHeadAndBottomLogIdInView(data, briefs);
            const index = data.findIndex(item => {
              return item.id === highlightPairs.startLogId;
            });
            rollingListManually(index);
            this.setState({uploading: false});
          })
      } else {
        this.setState({downloading: true});
        this.lastDownloadTime = Date.now();
        const highlightPairs = this.getHeadAndBottomLogIdInView(data, briefs);
        const detailIds = briefs.slice(endPageIndex * pageSize, (endPageIndex + 1) * pageSize).map(item => item.id);
        fetchTaskDetail(detailIds, "down")
          .then(() => {
            const index = data.findIndex(item => {
              return item.id === highlightPairs.startLogId;
            });
            rollingListManually(index);
            this.setState({downloading: false});
          })

      }
    }
  };



  // 在视窗中日志有变时触发
  updateHighLightIndex = () => {
    const {data, briefs, updateHighLightIndex} = this.props;
    let logHeadAndBottomInView = this.getLogHeadAndBottomInView(data, briefs);
    updateHighLightIndex(logHeadAndBottomInView.startLogIndex, logHeadAndBottomInView.endLogIndex);
  };

  // 获取视窗中的头尾日志id
  getLogHeadAndBottomInView = (logList, logIndexList) => {
    let scrollTopOfLogList = document.querySelector("#infinite-container-inner").scrollTop;
    let heightOfView = document.querySelector("#infinite-container-inner").clientHeight;

    let numberOfLogBeforeHead = Math.max(Math.round(scrollTopOfLogList / LOG_MOVE_DISTANCE), 0);
    let numberOfLogInView = Math.round(heightOfView / LOG_MOVE_DISTANCE);

    if (logList.length > 0 && logIndexList.length > 0) {
      let logHead = logList[Math.min(numberOfLogBeforeHead, logList.length - 1)].id;
      let logBottom = logList[Math.min(numberOfLogBeforeHead + numberOfLogInView, logList.length - 1)].id;

      return {
        startLogIndex: logIndexList.findIndex(logIndexItem => {
          return logIndexItem.id === logHead;
        }),
        endLogIndex: logIndexList.findIndex(logIndexItem => {
          return logIndexItem.id === logBottom;
        })
      };
    } else {
      return {
        startLogIndex: -1,
        endLogIndex: -1
      };
    }
  };

  getHeadAndBottomLogIdInView = (logList, logIndexList) => {
    let scrollTopOfLogList = document.querySelector("#infinite-container-inner").scrollTop;
    let heightOfView = document.querySelector("#infinite-container-inner").clientHeight;

    let numberOfLogBeforeHead = Math.max(parseInt(scrollTopOfLogList / LOG_MOVE_DISTANCE), 0);
    let numberOfLogInView = parseInt(heightOfView / LOG_MOVE_DISTANCE);

    if (logList.length > 0 && logIndexList.length > 0) {
      let logHead = logList[Math.min(numberOfLogBeforeHead, logList.length - 1)].id;
      let logBottom = logList[Math.min(numberOfLogBeforeHead + numberOfLogInView, logList.length - 1)].id;

      return {
        startLogId: logHead,
        endLogId: logBottom
      };
    } else {
      return {
        startLogId: -1,
        endLogId: -1
      };
    }
  };

  calculateIndexOfLogList = (logId, details) => {
    return details.findIndex(item => item.id === logId);
  }
}

export default LogListInfiniteScroll;

/// 以下全为辅助组件
function TimelineItem({item, index, focusLogId, type, updateFocusLogId}) {
  const LogTypes = type === "native" ? nativeLogTypeConfigs : webLogTypeConfigs;
  let logType = LogTypes.find(type => type.logType === item.logType);
  if (logType === undefined) {
    logType = {
      logType: 0,
      logTypeName: "未知日志",
      displayColor: "#000000"
    };
  }
  return (
    <Timeline.Item
      className={style["timeline-item"]}
      id={"log-item-row-" + index}
      color={logType.displayColor}
      key={"log-item-row-" + item.id}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        updateFocusLogId(item.id);
      }}
    >
      <div
        style={{
          backgroundColor: item.id === focusLogId ? "#e6f7ff" : "transparent"
        }}
      >
        <div className={style["log-time-title"]}>
          <div className={style["log-time-title-left"]}>
            <div className={style["log-type"]} style={{color: logType.displayColor}}>
              {logType.logTypeName}:
            </div>
            <div className={style["log-time"]}>{moment(item.logTime).format("HH:mm:ss.SSS")}</div>
          </div>
          <div className={style["log-time-title-right"]}>
            <div className={style["log-id"]}>日志ID：{item.id}</div>
          </div>
        </div>
        <div className={style["log-content"]}>
          <div className={style["log-abbr"]}>{item.simpleContent || item.content}</div>
        </div>
      </div>
    </Timeline.Item>
  );

}
