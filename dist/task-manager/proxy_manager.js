'use strict';

const { reject } = require("async");
const { resolve } = require("bluebird-lst");

/**
 * A proxy object containing the host, port, username, and password of a proxy
 * 
 * @typedef {Object} Proxy
 * 
 * @property {string} host - Hostname of the proxy
 * @property {string} port - Port of the proxy
 * @property {?string} username - Username of the proxy
 * @property {?string} password - Password of the proxy
 * @property {?Object} uses - Object containing counters, determining amount of use by task id
*/

/**
 * A group of proxies, containing an id, name, and array of proxy objects
 * 
 * @typedef {Object} ProxyGroup
 * 
 * @property {string} id - Id of the proxy group
 * @property {string} group_name - Frtonend visible alias of the proxy group
 * @property {Array.<Proxy>} proxies - Proxies in the given proxy group
 */

 /**
 *  Manages proxy and group creation, deletion, along with managing proxy rotation in tasks
 */
class ProxyManager {
    constructor(getTasks) {

        this.getTasks = getTasks

        /**
         * Proxies
         * @param {{groups: Array.<ProxyGroup>}} groups - An array of proxy groups stored in the ProxyManager
         */
        this.proxies = {
            groups: [
                {id: null, group_name: "No Proxy", proxies: []}
            ]
        };
    }

    
    /**
     * Checks if a proxy is a duplicate of another proxy
     * 
     * @function proxyIsDuplicate
     * 
     * @param {Proxy} _proxy - First proxy to compare to second proxy
     * @param {Proxy} proxy - Second proxy to compare to first proxy
     * 
     * @returns {boolean} - Returns true if the two proxies being compared are equal
     */
    proxyIsDuplicate(_proxy, proxy) {
        return _proxy.host === proxy.host && _proxy.port === proxy.port && _proxy.username === proxy.username && _proxy.password === proxy.password;
    }

    /**
     * Increments the use counter of a proxy, based upon the given task's id and site
     * 
     * @function incrementUsesCounter
     * 
     * @param {Object} args - Arguments to increment proxy's uses counter
     * @param {Array} args.tasks - Array of current tasks
     * @param {string} args.task_id - Id of the task using the proxy
     * @param {string} args.group_id - Id of the group the proxy belongs to
     * @param {Proxy} args.proxy - Proxy to increment use counter of
     * 
     */
    incrementUsesCounter({tasks, task_id, group_id, proxy}) {
        const taskIndex = tasks.findIndex(_task => _task.id === task_id),
              groupIndex = this.proxies.groups.findIndex(_group => _group.id === group_id),
              proxyIndex = this.proxies.groups[groupIndex].proxies.findIndex(_proxy => this.proxyIsDuplicate(_proxy, proxy)),
              site = tasks[taskIndex].runArgs.site;

        if (this.proxies.groups[groupIndex].proxies[proxyIndex].uses[site]) {
            if (this.proxies.groups[groupIndex].proxies[proxyIndex].uses[site][task_id]) {
                // Increment the proxy's task id counter if it exists
                this.proxies.groups[groupIndex].proxies[proxyIndex].uses[site][task_id]++;
            } else {
                // If the proxy's task id counter for the site does not exist, create it
                this.proxies.groups[groupIndex].proxies[proxyIndex].uses[site][task_id] = 1;
            }
        } else {
            // Create site with task id counter if the site property does not exist
            this.proxies.groups[groupIndex].proxies[proxyIndex].uses[site] = {
                [task_id]: 1
            };
        }

    }

    /**
     * Create a new group of proxies
     * 
     * @function createGroup
     * 
     * @param {Object} args - Arguments to create a group
     * @param {string} args.id - Id to assign the created group
     * @param {string} args.group_name - Name to assign the created group
     */
    createGroup({id, group_name}, callback) {
        try {
            // Check if current groups include colliding ids or names with group being created
            if (this.proxies.groups.length && this.proxies.groups.some(_group => _group.id === id || _group.group_name.toLowerCase().trim() === group_name.toLowerCase().trim())) {
                return callback ? callback({success: false}) : false;
            } else {
                this.proxies.groups.push({
                    id: id,
                    group_name: group_name,
                    proxies: []
                });
                return callback ? callback({success: true}) : true;    
            }
        }
        catch (err) {
            return callback ? callback({success: false}) : false;
        }
    }

    /**
     * Delete a group of proxies
     * 
     * @function deleteGroup
     * 
     * @param {Object} args - Arguments to create a group
     * @param {string} args.id - Id of the group to delete
     */
    async deleteGroup({id}, callback) {
        try {
            // Check if group with id to be deleted exists
            if (this.proxies.groups.length && this.proxies.groups.some(_group => _group.id === id)) {
                const index = this.proxies.groups.findIndex(_group => _group.id === id);

                const tasks = await this.getTasks()

                // Check if group is in use by a task
                if (tasks.some(_task => _task.runArgs.proxy.group === id)) {
                    return callback ? callback({success: false}) : false;
                } else {
                    this.proxies.groups.splice(index, 1);

                    return callback ? callback({success: true}) : true;    
                }
            } else {
                return callback ? callback({success: false}) : false;    
            }
        }
        catch (err) {
            return callback ? callback({success: false}) : false;
        }
    }

    /**
     * Add a proxy to a group
     * 
     * @function addProxy
     * 
     * @param {Object} args - Arguments to add a proxy to a group
     * @param {string} args.id - Id of the group to add the proxy to 
     * @param {Proxy} args.proxy - Proxy to add into group
     */
    addProxy({id, proxy}, callback) {
        try {
            // Check if group with given id to add proxy into exists and does not already include the same proxy to add
            if (this.proxies.groups.length && this.proxies.groups.some(_group => _group.id === id && !_group.proxies.some(_proxy => this.proxyIsDuplicate(_proxy, proxy)))) {
                this.proxies.groups.find(_group => _group.id === id).proxies.push({
                    host: proxy.host,
                    port: proxy.port,
                    username: proxy.username,
                    password: proxy.password,
                    uses: {}
                });
                return callback ? callback({success: true}) : true;

            } else {
                return callback ? callback({success: false}) : false;
            }
        }
        catch (err) {
            return callback ? callback({success: false}) : false;
        }
    }

    /**
     * Delete a proxy
     * 
     * @function deleteProxy
     * 
     * @param {Object} args - Arguments to delete a proxy
     * @param {string} args.id - Id of the group containing the proxy 
     * @param {Proxy} args.proxy - Proxy to remove from group
     */
    async deleteProxy({id, proxy}, callback) {
        try {
            // Check if group with given id to delete proxy exists and includes the same proxy to delete
            if (this.proxies.groups.length && this.proxies.groups.some(_group => _group.id === id && _group.proxies.some(_proxy => this.proxyIsDuplicate(_proxy, proxy)))) {
                const groupIndex = this.proxies.groups.findIndex(_group => _group.id === id),
                      proxyIndex = this.proxies.groups[groupIndex].proxies.findIndex(_proxy => this.proxyIsDuplicate(_proxy, proxy));

                const tasks = await this.getTasks()

                // Check if proxy is in use with a task
                if (tasks.some(_task => _task.runArgs.proxy.current.host === this.proxies.groups[groupIndex].proxies[proxyIndex].host && _task.runArgs.proxy.current.port === this.proxies.groups[groupIndex].proxies[proxyIndex].port && _task.runArgs.proxy.current.username === this.proxies.groups[groupIndex].proxies[proxyIndex].username && _task.runArgs.proxy.current.password === this.proxies.groups[groupIndex].proxies[proxyIndex].password)) {
                    return callback ? callback({success: false}) : false;
                } else {
                    this.proxies.groups[groupIndex].proxies.splice(proxyIndex, 1);

                    return callback ? callback({success: true}) : true;
                }
            } else {
                return callback ? callback({success: false}) : false;
            }
        } catch (err) {
            return callback ? callback({success: false}) : false;
        }
    }


    /**
     * Import groups into the ProxyManager
     * 
     * @function importGroups
     * 
     * @param {Object} args - Arguments to import groups
     * @param {Array.<ProxyGroup>} args.groups - Array of groups of proxies to import 
     */
    importGroups({groups}, callback) {
        try {
            // Filter groups being imported for locally duplicate names, ids and proxies, attach uses parameter to proxies object
            let _groups = groups.filter((group, i) => groups.findIndex(_group => _group.id === group.id || _group.group_name.toLowerCase().trim() === group.group_name.toLowerCase().trim()) === i);
                _groups.forEach(group => {
                    group.proxies = group.proxies.filter((proxy, i) => group.proxies.findIndex(_proxy => this.proxyIsDuplicate(_proxy, proxy)) === i);
                    group.proxies.forEach(_proxy => _proxy.uses = {});
                });

            // Check if current groups include colliding ids or names with groups being imported
            if (this.proxies.groups.length && _groups.some(group => this.proxies.groups.find(_group => _group.id === group.id || _group.group_name.toLowerCase().trim() === group.group_name.toLowerCase().trim()))) {
                return callback ? callback({success: false}) : false;
            } else {
                this.proxies.groups = [
                    ...this.proxies.groups,
                    ..._groups
                ];
                return callback ? callback({success: true}) : true;
            }
        } catch (err) {
            return callback ? callback({success: false}) : false;
        }
    }

    /**
     * Used to request an initial or new proxy from the scope of a task, given it's id
     * 
     * @function requestNewProxy
     * 
     * @param {Object} args - Arguments to request a new proxy
     * @param {string} args.id - Id of the task requesting a new proxy
     */
    async requestNewProxy({id}) {
        try {
            const tasks = await this.getTasks()

            const taskIndex = tasks.findIndex(_task => _task.id === id),
                  proxyGroupId = tasks[taskIndex].runArgs.proxy.group,
                  currentProxyGroup = this.proxies.groups.find(_group => _group.id === proxyGroupId),
                  hasAssignedProxy = tasks[taskIndex].runArgs.proxy.current.host && tasks[taskIndex].runArgs.proxy.current.port && tasks[taskIndex].runArgs.proxy.current.username && tasks[taskIndex].runArgs.proxy.current.password ? true : false;

            // No proxy group means local proxy, therefore return success and don't rotate the proxy, or if theres only 1 proxy in the group return success and don't rotate the proxy
            if (!proxyGroupId || hasAssignedProxy && currentProxyGroup.length <= 1) {
                return {rotate: false}
            }

            // Find started tasks other than the one requesting a new proxy which are using the same site and proxy group as the task requesting a new proxy
            const proxyGroupSiteTasks = tasks.filter((_task, i) => i !== taskIndex && _task.runArgs.proxy.group === proxyGroupId && _task.runArgs.site === tasks[taskIndex].runArgs.site && _task.state.started && !_task.state.stopped);

            // Multi task proxy rotation logic
            if (proxyGroupSiteTasks.length) {
                // Find what proxies are being used from the group, including the current task's proxy if assigned one, filter out duplicates
                let proxiesInUse = [
                        ...proxyGroupSiteTasks.map(_task => _task.runArgs.proxy.current),
                        ...(hasAssignedProxy ? [tasks[taskIndex].runArgs.proxy.current] : [])
                    ];
                    proxiesInUse = proxiesInUse.filter((proxy, i) => proxiesInUse.findIndex(_proxy => this.proxyIsDuplicate(_proxy, proxy)) === i);
                    
                // Check if there are any proxies in the same site and proxy group which have not been assigned to any tasks with the same site and proxy group
                let availableProxies = currentProxyGroup.proxies.filter(proxy => !proxiesInUse.some(_proxy => this.proxyIsDuplicate(_proxy, proxy)));

                // If there are no available proxies or only 1 available proxy, use the proxy group list
                if (availableProxies.length <= 1) {
                    availableProxies = [
                        ...currentProxyGroup.proxies.filter(_proxy => !this.proxyIsDuplicate(_proxy, tasks[taskIndex].runArgs.proxy.current))
                    ]

                    // Incremenet current proxy to not loop between using the same proxy again with the same tasks
                    hasAssignedProxy && this.incrementUsesCounter({tasks, task_id: id, group_id: proxyGroupId, proxy: tasks[taskIndex].runArgs.proxy.current});
                }

                // Sort by least used proxy being the lowest index in the availableProxies array
                availableProxies.sort((a, b) => {
                    if (a.uses[tasks[taskIndex].runArgs.site] && b.uses[tasks[taskIndex].runArgs.site]) {
                        const total_a = Object.values(a.uses[tasks[taskIndex].runArgs.site]).reduce((a, b) => a + b);
                        const total_b = Object.values(b.uses[tasks[taskIndex].runArgs.site]).reduce((a, b) => a + b);
                        return total_a - total_b;
                    } else if (b.uses[tasks[taskIndex].runArgs.site]) {
                        return -1;
                    } else {
                        return 0;
                    }
                })

                const { host, port, username, password } = availableProxies[0];

                const current = {
                    host,
                    port,
                    username,
                    password,
                    parsed: `${username && password ? `http://${username}:${password}@${host}:${port}` : `http://${host}:${port}`}`
                };

                this.incrementUsesCounter({tasks, task_id: id, group_id: proxyGroupId, proxy: availableProxies[0]});

                return {rotate: true, current}
            } else if (!hasAssignedProxy) { // Initial single task proxy rotation logic 
                // If no tasks are using any proxies from the proxy group, and the task does not have a proxy, assign the first proxy in the proxy group to the requesting task
                const { host, port, username, password } = currentProxyGroup.proxies[0];

                const current = {
                    host,
                    port,
                    username,
                    password,
                    parsed: `${username && password ? `http://${username}:${password}@${host}:${port}` : `http://${host}:${port}`}`
                };

                this.incrementUsesCounter({tasks, task_id: id, group_id: proxyGroupId, proxy: currentProxyGroup.proxies[0]});

                return {rotate: true, current}
            } else { // Next proxy single task proxy rotation logic 
                // If no tasks are using proxies from the proxy group and the task already has an assigned proxy, assign the next available proxy in the proxy group to the requesting task
                const currentProxyIndex = currentProxyGroup.proxies.findIndex(_proxy => this.proxyIsDuplicate(_proxy, tasks[taskIndex].runArgs.proxy.current)),
                      nextProxyIndex = currentProxyIndex === currentProxyGroup.proxies.length - 1 ? 0 : currentProxyIndex + 1;
            
                const { host, port, username, password } = currentProxyGroup.proxies[nextProxyIndex];

                const current = {
                    host,
                    port,
                    username,
                    password,
                    parsed: `${username && password ? `http://${username}:${password}@${host}:${port}` : `http://${host}:${port}`}`
                };

                this.incrementUsesCounter({tasks, task_id: id, group_id: proxyGroupId, proxy: currentProxyGroup.proxies[nextProxyIndex]});

                return {rotate: true, current}
            }
        }
        catch (err) {
            console.error(`Error rotating proxy for task id ${id}, Error: ${err}`)
            return err
        }
    }

    /**
     * Used to return the requestNewProxy function with the scope of this being binded to the ProxyManager class, instead of the task's scope or taskmanager's scope
     * 
     * @function getRequestNewProxy
     */
    getRequestNewProxy = () => this.requestNewProxy.bind(this)

}

module.exports = ProxyManager;