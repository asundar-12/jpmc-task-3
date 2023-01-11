import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;
    //modifying schema of object to change view of graph, adding attributes such as ratio to compare two stocks ratios, upper bound and lower bound as thresholds for the stock price ratio, and the period in which the bounds have been crossed by the line

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound:'float',
      lower_bound: 'float',
      trigger_alert: 'float'
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      //setting the display attributes of the graph just as in task 2
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      //only dealing with stocks ratio now, so removed column pivots (which distinguished stock ABC with Stock DEF as 2 lines)
      elem.setAttribute('columns', '["ratio","lower_bound", "upper_bound", "trigger_alert"]');
      //aggregation of duplicate data
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio:'avg',
        timestamp:'distinct count',
        upper_bound: 'avg',
        lower_bound:'avg',
        trigger_alert:'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([

        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
