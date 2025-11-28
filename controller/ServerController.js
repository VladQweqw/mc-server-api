const db = require("../database");
const utils = require("../utils/utils")

const { spawn } = require("child_process")

const BASE_PATH = '/mnt/SSD1TB/Minecarft'

async function cli(req, res) {
    let cmd = req.query?.command
    const session_key = req.cookies.session_key
    
    if (!session_key) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key"
        })
    }

    if (!req.body || !cmd) {
        return res.status(400).json({
            error: "Invalid data sent",
            status: "error"
        })
    }

    try {
        admin_id = utils.verifyUserFromSession(session_key)

        if(!admin_id) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid session key"
            })
        }

        const response = utils.cli(cmd)
        
        if(response.status === 'error') {
            return res.status(400).json({
                status: 'error',
                error: response.output
            })
        }
        
        
        return res.status(200).json({
                status: 'success',
                error: response.output
            })
    }
    catch (err) {
        console.log(err);
        
        return res.status(400).json({
            error: "An error occured",
            status: "error"
        })
    }
}

async function start(req, res) {
    try {
        const script = spawn('bash', [`${BASE_PATH}/start_server.sh`]);

        script.stdout.on('data', (data) => {
            console.log(data);
            
            return res.status(400).json({
                message: data,
                status: "error"
            })
        })

        script.stderr.on('data', (data) => {
            return res.status(400).json({
                message: data.error,
                status: "error"
            })
        })

    } catch (err) {        
        return res.status(400).json({
            error: "An error occured",
            status: "error"
        })
    }
}

async function stop(req, res) {
    let cmd = req.query?.command
    
    if (!req.body || !cmd) {
        return res.status(400).json({
            error: "Invalid data sent",
            status: "error"
        })
    }

    try {
        const output = utils.cli(cmd)
        console.log(output);
        
    }
    catch (err) {
        console.log(err);
        
        return res.status(400).json({
            error: "An error occured",
            status: "error"
        })
    }
}

module.exports = {
    start,
    stop,
    cli
}