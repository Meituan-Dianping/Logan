import React, { Component, Fragment } from "react";
import { isEqual } from "lodash";
import Konva from "konva";
import moment from "moment";

class TimeMiniMap extends Component {
  constructor(props) {
    super(props);

    this.$container = null;

    this.stage = null;
    this.timeline = null;
    this.hoverMark = null;
    this.locator = null;

    this.timelineMarginTop = 0;
    this.timelineMarginBottom = 0;
    this.timelineHeight = 0;
    this.timelineWidth = 0;
    this.timelineLeftOffset = 0;

    this.state = {
      showToolTip: false,
      toolTipX: 0,
      toolTipY: 0,
      hoveredLog: null
    };
  }

  render() {
    return (
      <Fragment>
        <div id="timeline-container" style={{ width: "50px", height: "100%", display: "flex" }}></div>
        <LogTooltip
          hoveredLog={this.state.hoveredLog}
          showing={this.state.showToolTip}
          x={this.state.toolTipX}
          y={this.state.toolTipY}
        />
      </Fragment>
    );
  }

  componentDidMount() {
    this._initComponents();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {data, startIndex, endIndex} = this.props;
    return (!isEqual(nextProps.data, data)) || (startIndex !== nextProps.startIndex) || (endIndex !== nextProps.endIndex) || (!isEqual(nextState, this.state));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {data, startIndex, endIndex} = this.props;
    if ((this.$container.clientHeight !== this.stage.getHeight()) ||
        (!isEqual(prevProps.data, data)) ||
        (startIndex !== prevProps.startIndex) ||
        (endIndex !== prevProps.endIndex)) {
      this._initComponents();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("click", this.onClick);
  }

  onMouseMove = event => {
    const { data } = this.props;

    if (this._isInTimeline(event.offsetX, event.offsetY)) {
      const logIndex = this._calculateLogIndexFromCoordinate(event.offsetX, event.offsetY - this.timelineMarginTop);

      if (logIndex !== null && event.target.localName === "canvas") {
        this.setState({
          showToolTip: true,
          toolTipX: this.$container.clientWidth + this.$container.offsetLeft,
          toolTipY: event.clientY,
          hoveredLog: data[logIndex]
        });
      }
      this.hoverMark.y(event.offsetY);
      if (!this.hoverMark.isVisible()) {
        this.hoverMark.show();
      }
    } else {
      this.setState({
        showToolTip: false
      });
      if (this.hoverMark.isVisible()) {
        this.hoverMark.hide();
      }
    }
    if (event.target.localName === "canvas") {
      this.stage.draw();
    }
  };

  onClick = event => {
    if (this._isInTimeline(event.offsetX, event.offsetY) && event.target.localName === "canvas") {
      const { updateFocusLogId } = this.props;
      if (this.state.hoveredLog !== null) {
        updateFocusLogId(this.state.hoveredLog.id);
      }
    }
  };

  _prepareContainer = () => {
    this.$container = document.querySelector("#timeline-container");
    this.clientHeight = this.$container.clientHeight;
    this.clientWidth = this.$container.clientWidth;
  };

  _prepareHoverMark = () => {
    this.hoverMark = new Konva.Line({
      points: [4, 0, this.timelineLeftOffset + this.timelineWidth + 4, 0],
      stroke: "#8c8c8c",
      strokeWidth: 2
    });
    this.timeline.add(this.hoverMark);
    this.hoverMark.hide();
  };

  _prepareLocator = () => {
    const { startIndex, endIndex } = this.props;
    if (startIndex >= 0 && endIndex >= 0) {
      const [startX, startY] = this._calculateCoordinateFromLogIndex(startIndex);
      const [endX, endY] = this._calculateCoordinateFromLogIndex(endIndex);  // eslint-disable-line
      this.locator = new Konva.Rect({
        x: startX,
        y: startY,
        width: this.timelineWidth,
        height: endY - startY,
        stroke: "#000000",
        strokeWidth: 3,
        opacity: 0.5,
        fill: "#8c8c8c"
      });
      this.timeline.add(this.locator);
    }
  };

  _initComponents = () => {
    const { timelineMarginTop, timelineMarginBottom, timelineWidth, timelineLeftOffset, data } = this.props;


    if (this.$container === null) {
      this._prepareContainer();
    }
    this.stage = new Konva.Stage({
      container: "#timeline-container",
      width: this.$container.offsetWidth,
      height: this.$container.offsetHeight
    });
    this.timeline = new Konva.Layer({
      clearBeforeDraw: true
    });
    this.stage.add(this.timeline);


    this.timelineMarginTop = timelineMarginTop;
    this.timelineMarginBottom = timelineMarginBottom;
    this.timelineWidth = timelineWidth;
    this.timelineLeftOffset = timelineLeftOffset;
    this.timelineHeight = this.timeline.getHeight() - this.timelineMarginTop - this.timelineMarginBottom;


    this._renderOutline();

    if (data && data.length > 0) {
      this._renderBeginEndTimeStamp();
      this._renderLogLines();
    }
    this._prepareHoverMark();
    this._prepareLocator();
    this._initMouseEvent();
    this.stage.draw();
  };

  _renderOutline = () => {

    const timelineLeftBorder = new Konva.Line({
      // [x1, y1, x2, y2]
      points: [
        this.timelineLeftOffset,
        this.timelineMarginTop,
        this.timelineLeftOffset,
        this.timelineMarginTop + this.timelineHeight
      ],
      stroke: "grey",
      strokeWidth: 1
    });
    const timelineRightBorder = timelineLeftBorder.clone().move({ x: this.timelineWidth, y: 0 });
    this.timeline.add(timelineLeftBorder);
    this.timeline.add(timelineRightBorder);
  };

  _renderBeginEndTimeStamp = () => {
    const { data } = this.props;

    const startTime = new Konva.Text({
      fontFamily: "serif",
      fontSize: 11,
      text: moment(data[0].time).format("HH:mm:ss"),
      x: 5,
      y: 5
    });
    const endTime = new Konva.Text({
      fontFamily: "serif",
      fontSize: 11,
      text: moment(data[data.length - 1].time).format("HH:mm:ss"),
      x: 5,
      y: 5 + this.timelineMarginTop + this.timelineHeight
    });

    this.timeline.add(startTime);
    this.timeline.add(endTime);
  };

  _renderLogLines = () => {
    const { data } = this.props;
    const lineCanvasHeightSpan = this.timelineHeight / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const logLine = new Konva.Line({
        points: [
          this.timelineLeftOffset,
          lineCanvasHeightSpan * i + this.timelineMarginTop,
          this.timelineLeftOffset + this.timelineWidth,
          lineCanvasHeightSpan * i + this.timelineMarginTop
        ],
        strokeWidth: 1,
        stroke: data[i].logType.displayColor
      });
      this.timeline.add(logLine);
    }
  };

  _initMouseEvent = () => {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("click", this.onClick);
  };

  _isInTimeline = (x, y) => {
    const isHorizontalInner = x > this.timelineLeftOffset && x < this.timelineLeftOffset + this.timelineWidth;
    const isVerticalInner = y > this.timelineMarginTop && y < this.timelineMarginTop + this.timelineHeight;
    return isHorizontalInner && isVerticalInner;
  };


  _calculateLogIndexFromCoordinate = (x, y) => {
    const { data } = this.props;
    const MOUSE_TOLERENCE = 1; // 上下像素容错范围
    const lineCssHeightSpan = this.timelineHeight / (data.length - 1);
    const outOfLineRange = y % lineCssHeightSpan; // 鼠标hover处距离某条line多少高度
    if (outOfLineRange < MOUSE_TOLERENCE) {
      return parseInt(y / lineCssHeightSpan);
    } else if (outOfLineRange > lineCssHeightSpan - MOUSE_TOLERENCE) {
      return parseInt(y / lineCssHeightSpan) + 1;
    } else {
      return null;
    }
  };

  _calculateCoordinateFromLogIndex = index => {
    const { data } = this.props;
    const lineCssHeightSpan = this.timelineHeight / (data.length - 1);
    return [this.timelineLeftOffset, lineCssHeightSpan * index + this.timelineMarginTop];
  };
}

class LogTooltip extends React.Component {
  render() {
    const { hoveredLog, showing, x, y } = this.props;
    if (!hoveredLog || !showing) {
      return <div style={{ visible: false }}></div>;
    }
    const containerStyle = {
      position: "absolute",
      left: x,
      top: y,
      border: "1px solid #8c8c8c",
      backgroundColor: "white",
      borderRadius: "5px",
      padding: "0px 10px",
      lineHeight: "25px",
      zIndex: "999"
    };
    return (
      <div style={containerStyle}>
        日志ID: {hoveredLog.id}
        <br />
        时间: {moment(hoveredLog.time).format("HH:mm:ss.SSS")}
        <br />
        日志类型:
        <span style={{ color: hoveredLog.logType.displayColor }}>{hoveredLog.logType.logTypeName}</span>
      </div>
    );
  }
}

export default TimeMiniMap;
