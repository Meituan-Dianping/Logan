import React, { Component } from "react";
import {Button} from "antd";
import {parse} from "qs";
import {isEmpty, isNil} from "lodash";
import FilterBar from "./components/filter-bar/index";
import LogDetailCard from "./components/log-detail-card/index";
import LogInformation from "./components/log-information/index";
import LogListInfiniteScroll from "./components/loglist-infinite-scroll/index";
import TimeMiniMap from "./components/time-minimap/index";
import {convertBriefsToMinimapBriefs, convertBriefsToLoglistInfiniteScrollBriefs} from "../../../common/adapter"
import {NUMBER_OF_LOG_IN_SINGLE_PAGE} from "../../../consts/pagination"
import "./style.scss";
import {LOG_MOVE_DISTANCE} from "./components/loglist-infinite-scroll/consts";
import {fetchNativeDownloadUrlApi, fetchWebDownloadUrlApi} from "../../../common/api";



class LogDetailPage extends Component {

  render() {
    const {
      briefs,
      taskDetails,
      highlightStartIndex,
      highlightEndIndex,
      logInfo,
      logTypesInTask,
      filterConditions,
      focusLogId,
      logDetail,
      updateFilterConditions,
      updateFocusLogId,
      updateHighLightIndex,
      updateSorted,
      fetchTaskDetail,
      type,
      sorted
    } = this.props;

    const { upHasMore, downHasMore } = this._calculateUpHasMoreAndDownHasMore({briefs: briefs, startLogIndex: highlightStartIndex});

    return (
      <div className="logdetail-container">
        <div className="header">
          <Button icon="left" onClick={this.handleBackToListButtonClicked}>返回列表</Button>
          <LogInformation logInfo={logInfo} type={type}/>
          <Button icon="download" onClick={this.handleLogDownloadButtonClicked}>日志文件下载</Button>
        </div>
        <div className="content">
          <FilterBar
            type={type}
            filterConditions={filterConditions}
            logTypesInTask={logTypesInTask}
            onFilterConditionChanged={updateFilterConditions}
            rollingListManually={this.rollingListManually}
            onSortedChanged={updateSorted}
            sorted={sorted}
          />
          <div className="detail-container">
            {(briefs && convertBriefsToMinimapBriefs(briefs, type).length > 50) &&
              <TimeMiniMap
                type={type}
                timelineMarginTop={20}
                timelineMarginBottom={20}
                timelineWidth={30}
                timelineLeftOffset={8}
                data={convertBriefsToMinimapBriefs(briefs, type)}
                startIndex={highlightStartIndex}
                endIndex={highlightEndIndex}
                updateFocusLogId={updateFocusLogId}
                updateHighLightIndex={updateHighLightIndex}
              />
            }
            <LogListInfiniteScroll
              type={type}
              briefs={convertBriefsToLoglistInfiniteScrollBriefs(briefs, type)}
              upHasMore={upHasMore}
              downHasMore={downHasMore}
              data={taskDetails}
              focusLogId={focusLogId}
              updateHighLightIndex={updateHighLightIndex}
              updateFocusLogId={updateFocusLogId}
              fetchTaskDetail={fetchTaskDetail}
              rollingListManually={this.rollingListManually}
            />
            <LogDetailCard
              type={type}
              focusLogId={focusLogId}
              logDetail={logDetail}
              updateFocusLogId={updateFocusLogId}
            />
          </div>
        </div>
      </div>
    );
  }

  rollingListManually = (logIndex) => {
    const $listScroll = document.querySelector("#infinite-container-inner");
    if ($listScroll) {
      let nextScrollTop = logIndex * LOG_MOVE_DISTANCE - LOG_MOVE_DISTANCE;
      $listScroll.scrollTo(0, nextScrollTop);
    }
  };

  handleBackToListButtonClicked = () => {
    const { type, history, nativeListFilterConditions, webListFilterConditions } = this.props;
    if (type === "native") {
      const { deviceId, platform, beginTime, endTime } = nativeListFilterConditions;
      if (((!isEmpty(deviceId) && !isNil(deviceId)) && !isNil(platform) && !isNil(beginTime) && !isNil(endTime))) {
        history.push(`/native-list?deviceId=${deviceId}&beginTime=${beginTime}&endTime=${endTime}&platform=${platform}`)
      } else {
        history.push("/native-list")
      }
    } else {      
      const { deviceId, beginTime, endTime } = webListFilterConditions;
      if (((!isEmpty(deviceId) && !isNil(deviceId)) && !isNil(beginTime) && !isNil(endTime))) {
        history.push(`/web-list?deviceId=${deviceId}&beginTime=${beginTime}&endTime=${endTime}`)
      } else {
        history.push("/web-list")
      }
    }
  }

  handleLogDownloadButtonClicked = () => {
    if (this.props.location) {
      const {type} = this.props;
      const {tasks} = parse(this.props.location.search, { ignoreQueryPrefix: true });
      let downloadUrlPromise = null;
      if (type === "native") {
        downloadUrlPromise = fetchNativeDownloadUrlApi(tasks)
      } else {
        downloadUrlPromise = fetchWebDownloadUrlApi(tasks)
      }
      downloadUrlPromise.then(data => {
        // replace your own download logic here!
        window.open(`${window.location.origin}${data}`);
      })
    }
    
  };

  _calculateUpHasMoreAndDownHasMore = ({ briefs, startLogIndex }) => {
    let upHasMore = false;
    let downHasMore = false;
    const pageSize = NUMBER_OF_LOG_IN_SINGLE_PAGE;
    const pageNum = Math.ceil(briefs.length / pageSize);
    if (briefs.length > 0) {
      const pageIndex = Math.floor(startLogIndex / pageSize);
      if (pageIndex === 0) {
        upHasMore = false;
        downHasMore = true;
      } else if (pageIndex > 0 && pageIndex < pageNum) {
        upHasMore = true;
        downHasMore = true;
      } else {
        upHasMore = true;
        downHasMore = false;
      }
    }

    return { upHasMore, downHasMore };
  };

}

export default LogDetailPage;
