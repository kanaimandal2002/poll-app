import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Poll() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`/api/polls/${id}`);
        setPoll(res.data);
        
        // Check if user has already voted (simple IP-based check)
        const userIP = await axios.get('https://api.ipify.org?format=json');
        if (res.data.userIPs.includes(userIP.data.ip)) {
          setHasVoted(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPoll();

    // Setup socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinPoll', id);
    newSocket.on('updatePoll', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption) return;
    
    try {
      const userIP = await axios.get('https://api.ipify.org?format=json');
      await axios.post(`/api/polls/${id}/vote`, {
        optionId: selectedOption,
        userIP: userIP.data.ip
      });
      setHasVoted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (!poll) return <div>Loading...</div>;

  const chartData = {
    labels: poll.options.map(option => option.text),
    datasets: [
      {
        label: 'Votes',
        data: poll.options.map(option => option.votes),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{poll.question}</h1>
      
      {hasVoted ? (
        <div>
          <h2 className="text-xl mb-4">Results ({poll.totalVotes} votes)</h2>
          <div className="mb-6">
            <Bar data={chartData} />
          </div>
          <div className="space-y-2">
            {poll.options.map((option) => (
              <div key={option._id} className="flex items-center">
                <div className="w-1/3">{option.text}</div>
                <div className="w-2/3">
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 bg-blue-500 rounded-full"
                      style={{
                        width: `${(option.votes / poll.totalVotes) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.votes} votes ({Math.round((option.votes / poll.totalVotes) * 100)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Select your answer</h2>
          <div className="space-y-2 mb-6">
            {poll.options.map((option) => (
              <div key={option._id} className="flex items-center">
                <input
                  type="radio"
                  id={option._id}
                  name="pollOption"
                  checked={selectedOption === option._id}
                  onChange={() => setSelectedOption(option._id)}
                  className="mr-2"
                />
                <label htmlFor={option._id}>{option.text}</label>
              </div>
            ))}
          </div>
          <button
            onClick={handleVote}
            disabled={!selectedOption}
            className="w-full py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Submit Vote
          </button>
        </div>
      )}
    </div>
  );
}
