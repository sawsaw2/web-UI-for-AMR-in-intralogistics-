import React, { useState, useEffect } from 'react';

function Buttom_Connect() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ips, setIps] = useState([]);
  const [selectedIp, setSelectedIp] = useState('');
  const [newIp, setNewIp] = useState('');

  const buttonStyle = {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const inputStyle = {
    margin: '5px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  };

  const dropdownStyle = {
    margin: '5px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    width: '200px',
  };

  const handleSSHConnect = (command) => {
    if (!selectedIp) {
      alert('Please select an IP address');
      return;
    }

    fetch('http://localhost:3001/run-ssh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, command, ip: selectedIp }),
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    const fetchIps = async () => {
      try {
        const response = await fetch('http://localhost:3001/submit-ips');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setIps(data);
        setSelectedIp(data[0]); // Set the first IP as the default selected IP
      } catch (error) {
        console.error('Error fetching IPs:', error);
      }
    };

    fetchIps();
  }, []);

  const handleAddIp = () => {
    fetch('http://localhost:3001/add-ip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip: newIp }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add IP');
      }
      return response.text();
    })
    .then(data => {
      setIps([...ips, newIp]);
      setNewIp(''); // Clear the input field
    })
    .catch(error => console.error('Error:', error));
  };

  const handleDeleteIp = (ipToDelete) => {
    fetch('http://localhost:3001/delete-ip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip: ipToDelete }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete IP');
      }
      return response.text();
    })
    .then(data => {
      setIps(ips.filter(ip => ip !== ipToDelete));
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>CONNECTROBOT</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <select value={selectedIp} onChange={(e) => setSelectedIp(e.target.value)} style={dropdownStyle}>
        {ips.map((ip, index) => (
          <option key={index} value={ip}>{ip}</option>
        ))}
      </select>

      <button onClick={() => handleSSHConnect('connect_ssh')} style={buttonStyle}>
        ROSBRIDGE ON
      </button>
      <button onClick={() => handleSSHConnect('disconnect_ssh')} style={buttonStyle}>
        ROSBRIDGE OFF
      </button>
      <button onClick={() => handleSSHConnect('connect_robot')} style={buttonStyle}>
        SENSORON
      </button>
      <button onClick={() => handleSSHConnect('disconnect_robot')} style={buttonStyle}>
        SENSOROFF
      </button>

      <h2>Available IPs</h2>
      <ul>
        {ips.map((ip, index) => (
          <li key={index}>
            {ip}
            <button onClick={() => handleDeleteIp(ip)} style={{...buttonStyle, marginLeft: '10px'}}>Delete</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Add new IP"
        value={newIp}
        onChange={(e) => setNewIp(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleAddIp} style={buttonStyle}>Add IP</button>
    </div>
  );
}

export default Buttom_Connect;