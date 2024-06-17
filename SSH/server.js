const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); 
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const ipConfigPath = path.join(__dirname, '../scripts/ipConfig.js');
let ipConfig = require(ipConfigPath);
const paramConfig = require('../scripts/paramConfig');
const ipList = ipConfig.ROSBRIDGE_SERVER_IPS;

app.get('/get-ips', (req, res) => {
    console.log("List of IP addresses:", ipList);
    res.json(ipList);
});

app.post('/add-ip', (req, res) => {
    const { ip } = req.body;
    console.log("Received IP to add:", ip);
    console.log("Current IP list:", ipList);
    
    if (ip && !ipList.includes(ip)) {
        ipList.push(ip);
        saveIpConfig(ipList);
        res.send(`IP address ${ip} added successfully`);
    } else {
        res.status(400).send('Invalid IP or IP already exists');
    }
});

app.post('/delete-ip', (req, res) => {
    const { ip } = req.body;
    console.log("Received IP to delete:", ip);
    const index = ipList.indexOf(ip);
    if (index > -1) {
        ipList.splice(index, 1);
        saveIpConfig(ipList);
        res.send(`IP address ${ip} deleted successfully`);
    } else {
        res.status(400).send('IP not found');
    }
});

app.get('/submit-ips', (req, res) => {
    console.log("Submitting list of IP addresses:", ipList);
    res.json(ipList);
});

app.post('/run-ssh', (req, res) => {
    const { username, password, command, ip } = req.body;
    let sshCommand;

    switch (command) {
        case 'connect_ssh':
            sshCommand = `plink -ssh ${username}@${ip} -pw ${password} -batch "source catkin_ws/devel/setup.bash && roslaunch rosbridge_server rosbridge_websocket.launch"`;
            break;
        case 'disconnect_ssh':
            sshCommand = `plink -ssh ${username}@${ip} -pw ${password} -batch "source catkin_ws/devel/setup.bash && rosrun stop_robot stop_bridge.py"`;
            break;
        case 'connect_robot':
            sshCommand = `plink -ssh ${username}@${ip} -pw ${password} -batch "source catkin_ws/devel/setup.bash && roslaunch tugger_train_bringup robot.launch"`;
            break;
        case 'disconnect_robot':
            sshCommand = `plink -ssh ${username}@${ip} -pw ${password} -batch "source catkin_ws/devel/setup.bash && rosrun stop_robot stop_robot.py"`;
            break;
        default:
            res.status(400).send('Invalid command');
            return;
    }

    exec(sshCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error running SSH script');
        }
        res.send(`Script executed successfully: ${stdout}`);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

function saveIpConfig(ipList) {
    const updatedIpConfig = {
        ROSBRIDGE_SERVER_IPS: ipList
    };
    const fileContent = `const ipConfig = ${JSON.stringify(updatedIpConfig, null, 4)};\n\nmodule.exports = ipConfig;`;
    fs.writeFileSync(ipConfigPath, fileContent, 'utf-8');
}
