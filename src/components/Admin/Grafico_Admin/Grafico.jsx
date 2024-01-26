import React, { useEffect, useState } from "react";

import "./Style.css";
import ReactApexChart from "react-apexcharts";

const Grafico = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 5,
      },
      xaxis: {
        type: "datetime",
        categories: [],
        labels: {
          style: {
            colors: "var(--gray)",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "var(--gray)",
          },
        },
        tooltip: {
        theme: 'dark',
          enabled: true,
        },
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: "dd/MM/yy",
        },
      },
      grid: {
        borderColor: "var(--gray)",
        strokeDashArray: 1,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.5,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
        },
      },
      colors: ["var(--green)", "var(--gray)"],
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetY: 0,
        markers: {
          width: 10,
          height: 10,
        },
      },
    },
  });


  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost/nuovo/backend/Api/admin/getDataGraphic.php');
        if (response.ok) {
          const data = await response.json();

          // Combinar fechas de depósito y retiro para obtener todas las fechas únicas
          const allDates = [...new Set([...data.deposit.map(entry => entry.date), ...data.withdrawal.map(entry => entry.date)])];

          const seriesData = [
            {
              name: "Depósitos",
              data: allDates.map(date => ({
                x: new Date(date).getTime(),
                y: data.deposit.filter(entry => entry.date === date).reduce((total, entry) => total + parseFloat(entry.amount), 0),
              })),
            },
            {
              name: "Retiros",
              data: allDates.map(date => ({
                x: new Date(date).getTime(),
                y: data.withdrawal.filter(entry => entry.date === date).reduce((total, entry) => total + parseFloat(entry.amount), 0),
              })),
            },
          ];

          setChartData({
            series: seriesData,
            options: {
              ...chartData.options,
              xaxis: {
                ...chartData.options.xaxis,
                categories: allDates.map(date => new Date(date).getTime()),
              },
            },
          });
        } else {
          console.error('Error al obtener datos del gráfico');
        }
      } catch (error) {
        console.error('Error al obtener datos del gráfico:', error);
      }
    };

    fetchChartData();
  }, []); 

  return (
    <div className="grafico">
      <div id="chart">
      <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height={450}
        />
      </div>
    </div>
  );
};

export default Grafico;
