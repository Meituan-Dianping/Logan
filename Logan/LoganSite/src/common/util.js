import {findIndex} from "lodash";

import {NUMBER_OF_LOG_IN_SINGLE_PAGE} from "../consts/pagination";

export function getPageOfLogIdsBySingleLogId(briefs, singleLogId) {
  const indexOfBrief = findIndex(briefs, item => item.id === singleLogId);
  const pageSize = NUMBER_OF_LOG_IN_SINGLE_PAGE;
  const pageNum = Math.ceil(briefs.length / pageSize);
  const indexOfPage = Math.floor(indexOfBrief / pageSize);


  if (pageNum <= 3) {
    // if the number of pages is less than 3, fetch all
    return briefs.map(item => item.id);
  }

  if (indexOfPage === 0) {
    // if singleLogId is in the first page, fetch the very beginning 3 pages
    return briefs.slice(0, 3 * pageSize).map(item => item.id)
  } else if (indexOfPage === pageNum - 1) {
    // if singleLogId is in the last page, fetch the very last 3 pages
    return briefs.slice((pageNum - 3) * pageSize, pageNum * pageSize).map(item => item.id)
  } else {
    return briefs.slice((indexOfPage - 1) * pageSize, (indexOfPage + 2) * pageSize).map(item => item.id);
  }
}