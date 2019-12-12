import React, { Component } from "react";
import { Card, Button } from "antd";
import moment from "moment";
import "./style.scss";
import {nativeLogTypeConfigs, webLogTypeConfigs} from "../../../../../consts/logtypes";

const titleByKey = {
  "id": "日志编号",
  "taskId": "任务编号",
  "logType": "日志类型",
  "logTime": "日志记录时间"
};

class LogDetailCard extends Component {

  render() {
    const { focusLogId, logDetail } = this.props;
    if (focusLogId === -1) {
      return null;
    } else {
      const { cardTitle, closeButton, metaDatas } = this.conposeSnippetComponents();
      return (
        <Card
            className="detail-information-container"
            title={cardTitle}
            extra={closeButton}>
          <div className="metadata">
            { metaDatas }
          </div>
          {logDetail && <div className="log-content">
            日志信息:<br />
            { logDetail["content"] }
          </div>}
        </Card>
      );
    }
  }

  handleCloseButtonClicked = () => {
    this.props.updateFocusLogId(-1);
  };

  conposeSnippetComponents = () => {
    const { logDetail, type } = this.props;
    const logTypesConfig = type === "native" ? nativeLogTypeConfigs : webLogTypeConfigs;
    if (logDetail !== null) {
      const cardTitle = (
        <header>
          <h1>日志条目详情</h1>
        </header>
      );

      const closeButton = (
        <Button icon="close" shape="circle" size="small" onClick={this.handleCloseButtonClicked}/>
      );

      const metaDatas = Object.keys(logDetail).map(key => {
        if (!Object.keys(titleByKey).includes(key)) {
          return null;
        }
        let value = "";
        if (key === "logType") {
          const config = logTypesConfig.find(config => config.logType === logDetail[key]);
          if (config === undefined) {
            value = "未知日志";
          } else {
            value = config["logTypeName"];
          }
        } else if (key === "logTime") {
          value = moment(logDetail[key]).format('YYYY-MM-DD HH:mm:ss.SSS');
        } else {
          value = logDetail[key];
        }
        return (
          <div className="metadata-item" key={titleByKey[key]}>
            { titleByKey[key] } : { value }
          </div>
        )
      });

      return {
        cardTitle,
        closeButton,
        metaDatas
      }
    } else {
      return {
        cardTitle: null,
        closeButton: null,
        metaDatas: null
      }
    }

  };
}

export default LogDetailCard;
