const { resolve } = require("path");
const db = require("../database");
const utils = require("../utils/utils")

const { spawn, exec } = require("child_process")

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

        if(!utils.isUSerAdmin(admin_id)) {
            return res.status(400).json({
                status: 'error',
                error: "User not admin"
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
                output: response.output
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
    const session_key = req.cookies.session_key

    if (!session_key) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key"
        })
    }

    try {
        user_id = utils.verifyUserFromSession(session_key)

        if(!user_id || !utils.isUserVAlid(user_id)) {
            return res.status(400).json({
                status: 'error',
                error: "User not valid"
            })
        }

        spawn(`${BASE_PATH}/start_server.sh`, [], {
            cwd: BASE_PATH,
            detached: true
        });

        const max_tries = 30
        let tries = 0
        const interval = setInterval(async () => {            
  
            
            exec('docker ps | grep mc', { cwd: BASE_PATH }, (err, stdout, stderr) => {
                
                const txt = stdout.split("\n")
                
                if(/\bhealthy\b/.test(txt) && /\mc\b/.test(txt)) {
                    clearInterval(interval)
                     return res.status(200).json({
                        message: "Server started",
                        status: 'success'
                    })
                }
            });

            if(tries > max_tries) {
                clearInterval(interval)
                 return res.status(400).json({
                    message: "Server failed to start ( timeout)",
                    status: 'error'
                })
            }

            tries++
        }, 5000);

        
    } catch (err) {    
        console.log(`Start server err: ${err}`);
            
        return res.status(400).json({
            error: "An error occured",
            status: "error"
        })
    }
}

async function stop(req, res) {
    const session_key = req.cookies.session_key

    if (!session_key) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key"
        })
    }

    try {
        user_id = utils.verifyUserFromSession(session_key)

        if(!user_id || !utils.isUserVAlid(user_id)) {
            return res.status(400).json({
                status: 'error',
                error: "User not valid"
            })
        }

        spawn(`${BASE_PATH}/stop_server.sh`, [], {
            cwd: BASE_PATH,
            detached: true
        });

        const max_tries = 5
        let tries = 0
        const interval = setInterval(async () => {            
            exec('docker ps | grep mc', { cwd: BASE_PATH }, (err, stdout, stderr) => {
                
                const txt = stdout.split("\n")
                
                if(!/\bhealthy\b/.test(txt) && !/\mc\b/.test(txt)) {
                    clearInterval(interval)
                     return res.status(200).json({
                        message: "Server stopped",
                        status: 'success'
                    })
                }
            });

            if(tries > max_tries) {
                clearInterval(interval)
                 return res.status(400).json({
                    message: "Failed to stop server ( timeout) / ALready closed",
                    status: 'error'
                })
            }

            tries++
        }, 2000);
    } catch (err) {        
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