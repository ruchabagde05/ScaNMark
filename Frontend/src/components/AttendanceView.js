import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Lottie from 'react-lottie-player';
import studentAnimation from '../animations/scan.json';

const AttendanceView = ({ studentPrn }) => {
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false); // Control first render

  useEffect(() => {
    fetchSubjectAttendance();
  }, [studentPrn]);

  const fetchSubjectAttendance = async () => {
    try {
      const response = await fetch(`http://localhost:8085/api/students/${studentPrn}/attendance-percentage/subject-wise`);
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      
      const chartData = Object.entries(data).map(([subject, percentage]) => ({
        subject: subject,
        data: [
          { name: 'Present', value: percentage },
          { name: 'Absent', value: 100 - percentage }
        ]
      }));
      
      setSubjectAttendance(chartData);
      setLoading(false);
      
      // Introduce a slight delay before setting data ready to prevent flickering
      setTimeout(() => setIsDataReady(true), 100);
      
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p>{`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !isDataReady) {
    return (
      <div className="text-center p-4">
        Loading attendance data...
        <Lottie
            loop
            animationData={studentAnimation}
            play
            style={{ width: '300px', height: '300px', margin: '0 auto' }}
          />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="mb-4 text-center">Subject-wise Attendance</h4>
      
      <div className="row g-4">
        {subjectAttendance.map((subject) => (
          <div className="col-md-6 col-lg-4" key={subject.subject}>
            <div className="card h-100" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <h5 className="card-title text-center mb-3">{subject.subject}</h5>
                
                <div style={{ height: '200px', width: '100%' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={subject.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={50}
                        startAngle={90} 
                        endAngle={-270} 
                        isAnimationActive={true} 
                        animationBegin={0} 
                        animationDuration={2000} 
                        animationEasing="ease-in-out"
                      >
                        <Cell fill="#28a745" /> {/* Present */}
                        <Cell fill="#dc3545" /> {/* Absent */}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-center mt-3">
                  <h4 className={subject.data[0].value >= 75 ? 'text-success' : 'text-danger'}>
                    {subject.data[0].value.toFixed(1)}%
                  </h4>
                  {subject.data[0].value >= 75 ? (
                    <div className="text-success">Outstanding ✓</div>
                  ) : (
                    <div className="text-danger">Needs Attention !</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceView;