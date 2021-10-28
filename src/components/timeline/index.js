import React from 'react';
import { connect } from 'react-redux';
import { updatePipelineId } from '../../actions';
import { useQuery } from '@apollo/client';
import { GET_RUNS } from '../../apollo/queries';
import TimelineChart from './timeline-chart';

import './timeline.css';

const leftArea = 480;

export const Timeline = ({ onUpdatePipelineId, pipelineId, visible }) => {
  const { data } = useQuery(GET_RUNS);

  console.log('data', data);

  const updatePipeline = (id) => {
    onUpdatePipelineId('id');
  };

  // extract the data and no. of nodes from the data
  const plotData = data
    ? data.runsList.map((run) => ({
        date: run.metaData.timestamp,
        id: run.metaData.runId,
        title: run.metaData.title,
        value: run.metaData.selectedNodes,
      }))
    : [];

  const sortedPlotData = plotData.sort((a, b) => a.date - b.date);

  const transformStyle = {
    transform: `translate(calc(-100% + ${
      window.innerWidth - leftArea
    }px), -100%)`,
  };

  return (
    <div
      className="pipeline-timeline-container"
      style={visible ? transformStyle : {}}
    >
      <TimelineChart data={sortedPlotData} updatePipeline={updatePipeline} />
      <span>{pipelineId}</span>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    visible: state.visible.timeline,
    pipelineId: state.pipelineId,
  };
};

export const mapDispatchToProps = (dispatch) => ({
  onUpdatePipelineId: (value) => {
    dispatch(updatePipelineId(value));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
