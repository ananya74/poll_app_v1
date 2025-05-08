import Plot from 'react-plotly.js';

type Props = {
  options: string[];
  votes: number[];
};
const PollChart = (props: Props) => {
  const { options, votes } = props;
  const text = votes.map(String);
  const layout = {
    title: 'Poll Results',
    xaxis: {
      showgrid: false,
      showline: true,
    },
    yaxis: { visible: true },
  };
  const config = {
    scrollZoom: false,
    displayModeBar: false,
    editable: false,
    dragMode: false,
    staticPlot: true,
  };
  let data = [
    {
      y: options,
      x: votes,
      text: text,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: 'rgb(66, 165, 245)',
      },
    },
  ];
  return <Plot data={data} layout={layout} config={config} />;
};

export default PollChart;
