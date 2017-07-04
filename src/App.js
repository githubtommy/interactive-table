import React from 'react';
import './app.css';
import ReactDOM from 'react-dom';
import Moment from 'react-moment';
import moment from "moment";

// ----------------------------------------------------------------------------------------------------

/*
		By Tom Beaver, JUNE 11, 2017

		Notes:

		1. ES6 syntax
		2. Uses React.Component rather than the deprecated React.createClass
		3. App is a table of hard-coded JSON data with the following features
		   -- a sort widget
			 -- an in-cell popup for changing the "status" of each record
			 -- an in-cell button for deleting a record
			 -- when changing a record status, table is re-sorted
			 -- alternating row colors plus a special color for rows with "denied" status, plus rollover color
			 -- -- applied via React (using inline styles) rather than stylesheet because of the "denied" color
		4. Business and helper logic put into app modules for two reasons
			 a. Centralize shared logic without having to pass method references from parent to child
		   b. Keep the component code itself minimal for easy reasoning about the component's logic
		5. Moment.js used for
		   a. parsing date strings (vanilla JS support for this is spotty across browsers)
			 b. formatting date for display
		6. Every method is a pure function
		7. State is immutable
		   -- data changes made to clones of the data array and applied via setState()
 */

let APP = {};
APP.CONSTANTS = {};
APP.util = {};
APP.util.data = {};
APP.util.dates = {};

// ---------------------------------------------------
//
// Constants
//
// ---------------------------------------------------

APP.CONSTANTS = function() {
  return {
    DEFAULT_SORT_KEY: "sortKey", // "all", "approved", "pending", "denied"
    DEFAULT_FILTER_STRING: "All", // "all", "approved", "pending", "denied"
    ROW_COLOR_EVEN: "#DDEFDC",
    ROW_COLOR_ODD: "white",
    // Bonus Feature: colorize a row when rolled-over
    ROW_COLOR_DENIED: "#FDD7D1"
  }
}();

// ---------------------------------------------------
//
// Mock data
//
// ---------------------------------------------------

APP.REQUESTS =	[
    {"id":1, "title":"Request from Nancy","updated_at":"2015-08-15 12:27:01 -0600","created_at":"2015-08-12 08:27:01 -0600","status":"Denied"},
    {"id":2, "title":"Request from David","updated_at":"2015-07-22 11:27:01 -0600","created_at":"2015-07-15 12:27:01 -0600","status":"Approved"},
    {"id":3,"title":"Request from Matt","updated_at":"2015-07-22 11:27:01 -0600","created_at":"2015-06-15 13:27:01 -0600","status":"Pending"},
    {"id":4,"title":"Request from Perry","updated_at":"2015-07-15 13:27:01 -0600","created_at":"2015-07-14 14:27:01 -0600","status":"Pending"},
    {"id":5,"title":"Request from Harrison","updated_at":"2015-08-22 11:27:01 -0600","created_at":"2015-07-29 15:27:01 -0600","status":"Approved"},
    {"id":6,"title":"Request from Josh","updated_at":"2015-07-29 14:27:01 -0600","created_at":"2015-07-15 10:27:01 -0600","status":"Denied"},
    {"id":7,"title":"Request from Michael","updated_at":"2015-06-15 12:27:01 -0600","created_at":"2015-06-13 18:27:01 -0600","status":"Denied"},
    {"id":8,"title":"Request from AJ","updated_at":"2015-09-22 11:10:01 -0600","created_at":"2015-07-15 11:27:01 -0600","status":"Approved"},
    {"id":9,"title":"Request from Jane","updated_at":"2015-09-13 11:18:01 -0600","created_at":"2015-09-10 06:27:01 -0600","status":"Approved"},
    {"id":10,"title":"Request from Jizhen","updated_at":"2015-05-12 08:27:01 -0600","created_at":"2015-04-15 06:27:01 -0600","status":"Pending"},
    {"id":11,"title":"Request from Pardeep","updated_at":"2015-07-28 09:27:01 -0600","created_at":"2015-07-17 05:27:01 -0600","status":"Approved"},
    {"id":12,"title":"Request from Ale","updated_at":"2015-07-22 10:27:01 -0600","created_at":"2015-07-18 15:27:01 -0600","status":"Pending"},
    {"id":13,"title":"Request from Christy","updated_at":"2015-04-22 19:27:01 -0600","created_at":"2015-03-15 16:27:01 -0600","status":"Pending"},
    {"id":14,"title":"Request from Surjadeep","updated_at":"2015-07-01 11:27:01 -0600","created_at":"2015-06-29 17:27:01 -0600","status":"Approved"},
    {"id":15,"title":"Request from Vasanth","updated_at":"2015-07-02 11:27:01 -0600","created_at":"2015-07-01 18:27:01 -0600","status":"Approved"},
    {"id":16,"title":"Request from Moshe","updated_at":"2015-01-22 16:27:01 -0600","created_at":"2014-12-25 11:27:01 -0600","status":"Denied"},
    {"id":17,"title":"Request from Jim","updated_at":"2015-10-22 17:27:01 -0600","created_at":"2015-10-15 13:27:01 -0600","status":"Approved"},
    {"id":18,"title":"Request from Dileep","updated_at":"2015-08-18 18:27:01 -0600","created_at":"2015-07-11 12:27:01 -0600","status":"Denied"},
    {"id":19,"title":"Request from Aaron","updated_at":"2015-06-22 19:27:01 -0600","created_at":"2015-05-28 16:27:01 -0600","status":"Approved"},
    {"id":20,"title":"Request from Vijay","updated_at":"2015-02-14 08:27:01 -0600","created_at":"2015-01-02 12:27:01 -0600","status":"Approved"}
];

// ---------------------------------------------------
//
// Utils
//
// ---------------------------------------------------

// Offload detailed work to methods outside of the components so that the components themselves
// are easier to grok

APP.util.data = function() {

  function getRequestById (requests, requestId) {
    let result;
    let max = requests.length;
    for (let i = 0; i < max; i++) {
      let request = requests[i];
			// requestId got converted to String when passed data-attribute
      if (request.id === Number(requestId)) {
        result = request;
        break;
      }
    }
    return result;
  }

  function saveRequestToList (request, requests) {
    let clone = requests.slice(0);
    let max = clone.length;
    for (let i = 0; i < max; i++) {
      let item = clone[i];
			// request.id got converted to String when passed data-attribute
      if (item.id === Number(request.id)) {
        clone[i] = request;
        break;
      }
    }
    return clone;
  }

  function deleteRequestFromList (request, requests, componentState) {
    let clone = requests.slice(0);
    let max = clone.length;
    for (let i = 0; i < max; i++) {
      let item = clone[i];
      if (item.id === request.id) {
        clone.splice(i, 1);
        break;
      }
    }
    return clone;
  }

  // API

  return {
    saveRequestToList: saveRequestToList,
    deleteRequestFromList: deleteRequestFromList,
    getRequestById: getRequestById
  }
}();

APP.util.dates = function() {

  // Provide an alpha-sortable version of date
  function makeSortKeyFromDate (date) {
    return date.getTime();
  }

  // Maintain dates as Date objects, converting and formatting just-in-time
  function processIncomingDates (data) {
    let clone = data.slice(0);
    let max = clone.length;
    for (let i = 0; i < max; i++) {
      let item = clone[i];
      let tempDate;
      let timestamp;

      // clean up date string by removing space before timezone offset
      // e.g. convert "2015-08-12 08:27:01 -0600" to "2015-08-12 08:27:01-0600"
      // use moment.js to safely convert the resulting time string to a JS timestamp
			// because different browsers parse date strings differently
			let makeTimestamp = function(dateString) {
				var result = dateString;
				result = result.replace(" -", "-");
				result = result.replace(" +", "+");
				result = moment(result);
				return result;
			}
      item.created_at = new Date(makeTimestamp(item.created_at));
      item.updated_at = new Date(makeTimestamp(item.updated_at));

      // maintain a timestamp (date-as-milliseconds) for sorting purposes
      item.sortKey = APP.util.dates.makeSortKeyFromDate(item.updated_at);
      clone[i] = item;
    }
    return clone;
  }

  // Produces displayable date in format: 2015-07-09
  function formatDate (date) {
    return moment(date).format('YYYY/MM/DD');
  }

  // Business rule: sort requests on "updated_at" field, ascending
  function sortByDate (arr) {
    let clone = arr.slice(0);
    let key = APP.CONSTANTS.DEFAULT_SORT_KEY;
    clone.sort(function (a, b) {
      a = a[key];
      b = b[key];
      if (a < b) {
        return 1;
      } else if (a > b) {
        return -1;
      } else {
        return 0;
      }
    });
    return clone;
  }

  // API

	return {
    makeSortKeyFromDate: makeSortKeyFromDate,
    processIncomingDates: processIncomingDates,
    formatDate: formatDate,
    sortByDate: sortByDate
  }
}();

// ---------------------------------------------------
//
// React Components
//
// ---------------------------------------------------

// ---------------------------------------------------
// Component 4 of 4 -- SearchBar
// ---------------------------------------------------

// Responsibilities:
// 1. Display default search searchFilterString
// 2. Allow user to change the search searchFilterString
// 3. Pass user searchString up to main component for use by the table Component

class SearchBar extends React.Component {

	constructor(props) {
		super(props);
		this.onSearchFilterChange = props.onSearchFilterChange;
		this.handleChange = this.handleChange.bind(this);
	}

  handleChange(event) {
    this.onSearchFilterChange(event.target.value);
  }

  render () {
		return (
			<div className="searchBar">
        <div className="searchBar-inner">
          <span className="searchBar-label">Filter by Status: </span>
          <select value={this.props.searchFilterString} onChange={this.handleChange}>
            <option value="All" >All Requests</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Denied">Denied</option>
          </select>
        </div>
      </div>
		);
  }
};

// ---------------------------------------------------
// Component 3 of 4 -- RequestRow
// ---------------------------------------------------

class RequestRow extends React.Component {
	constructor(props) {
		super(props);
	}
  render() {
      return (
        <tr style={this.props.request.rowBgColor}>
          <td>{this.props.title}</td>
          <td>{this.props.status}</td>
          <td>{this.props.created}</td>
          <td>{this.props.updated}</td>
          <td>{this.props.delete}</td>
        </tr>
      );
  }
};

// ---------------------------------------------------
// Component 2 of 4 -- Request Table
// ---------------------------------------------------

// Responsibilities
// 1. Compose the table
// 2. Apply searchFilter changes
// 3. Manage sorting and filtering
// 4. Pass deletes and status-changes up to parent component

class RequestTable extends React.Component {

	constructor(props) {
		super(props);
		this.onItemStatusChange = props.onItemStatusChange;
		this.onItemDelete = props.onItemDelete;
		this.handleItemStatusChange = this.handleItemStatusChange.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

  handleItemStatusChange (event) {
    this.onItemStatusChange(event.target.dataset.requestid, event.target.value);
  }

  handleDeleteClick (request) {
    this.onItemDelete(request);
  }

  render () {

		let rows = [];
    let searchFilterString = this.props.searchFilterString;
    let rowNum = 0;
    let self = this;

    // Generate the table rows
    this.props.requests.forEach(function(request) {

      // Style the rows in alternating colors
      // Exception: rows with "Denied" status get a special color
      if (request.status === "Denied") {
        request.rowBgColor = {"backgroundColor": APP.CONSTANTS.ROW_COLOR_DENIED};
      } else if (rowNum % 2 === 0) {
        request.rowBgColor = {"backgroundColor": APP.CONSTANTS.ROW_COLOR_EVEN};
      } else {
        request.rowBgColor = {"backgroundColor": APP.CONSTANTS.ROW_COLOR_ODD};
      }
      rowNum++;

      // We force a render only on 1) first pass and 2) when search filter has changed
      if (searchFilterString === APP.CONSTANTS.DEFAULT_FILTER_STRING || request.status === searchFilterString) {

        // React scope trickiness: this gives us both element scope and component scope
        // Could accomplish the goal  using a data attribute (like how we handle the change-status action below)
        // but I wanted to show two different approaches
        let boundDeleteHandler = function(event) {
          self.handleDeleteClick(request)
        };

        // Build the table rows as instances of our RequestRow components
        rows.push(<RequestRow
          key={request.id}
          request={request}
          title={request.title}
          created={APP.util.dates.formatDate(request.created_at)}
          updated={APP.util.dates.formatDate(request.updated_at)}
					status={  <select data-requestid={request.id} className="statusDropdown" value={request.status} onChange={this.handleItemStatusChange}>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Denied">Denied</option>
                    </select> }
          delete={<a href="#" onClick={boundDeleteHandler}>Delete</a>}
          />
        )
      }
    }.bind(this));

    return(
      <table className="requestTable">
          <thead>
              <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Delete</th>
              </tr>
          </thead>
          <tbody>{rows}</tbody>
       </table>
    );
  }
};

// ---------------------------------------------------
// Component 1 of 4 -- App
// ---------------------------------------------------

// Responsibilities
// 1. Compose the sub-components into a searchBar and table
// 2. Manage common state
// 3. Manage changes to data

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			requests: props.requests,
			searchFilterString: APP.CONSTANTS.DEFAULT_FILTER_STRING
		}
		this.onSearchFilterChange = this.onSearchFilterChange.bind(this);
		this.onItemStatusChange = this.onItemStatusChange.bind(this);
		this.onItemDelete = this.onItemDelete.bind(this);
	}

  // Convert date strings of original data into Date objects
  // Move props data into state so that it's available in subsequest digest cycles
  componentWillMount() {
    let clone = this.state.requests.slice(0);

    clone = APP.util.dates.processIncomingDates(clone);
    clone = APP.util.dates.sortByDate(clone);
    this.setState({requests: clone});
  }

  onSearchFilterChange(searchFilterString) {
    this.setState({searchFilterString: searchFilterString});
  }

  onItemStatusChange(requestId, value) {
    let request, clone, now;

    clone = this.state.requests.slice(0);
    request = APP.util.data.getRequestById(this.state.requests, requestId);
    request.status = value;
    now = new Date();
    request.updated_at = now;
    request.sortKey = APP.util.dates.makeSortKeyFromDate(now);
    clone = APP.util.data.saveRequestToList(request, clone);
    clone = APP.util.dates.sortByDate(clone);
    this.setState({requests: clone});
  }

  onItemDelete(request) {
    let clone = APP.util.data.deleteRequestFromList(request, this.state.requests)
    this.setState({requests: clone});
  }

  render() {
      return (
      	<div className="app">
        	<SearchBar
            onSearchFilterChange={this.onSearchFilterChange}
            searchFilterString={this.state.searchFilterString}
						dog="uma"
          />
        	<RequestTable
          	requests={this.state.requests}
            searchFilterString={this.state.searchFilterString}
            onItemStatusChange={this.onItemStatusChange}
            onItemDelete={this.onItemDelete}
          />
        </div>
      );
  }
};

ReactDOM.render(<App className="request-app" requests={APP.REQUESTS}/>, document.getElementById('root'));

// ----------------------------------------------------------------------------------------------------

export default App;
