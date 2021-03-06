/* Saving and Updating Data File */

const fs = require('fs');
const {promisify} = require('util');
const os = require('os');

const readFile = promisify(fs.readFile);  // callback -> promise

class Dataworker {

    static async get_tasks(data_dir, sort_type=null) {
        /* Get Task List from json File */
        let task_list = await readFile(`${data_dir}`, "utf8");

        task_list = JSON.parse(task_list);

        // If we need sort list
        if (sort_type != 'last') {
            // Sorting getted task list
            task_list = task_list.sort((t1, t2) => t1['date'] - t2['date'])
            task_list = task_list.sort((t1, t2) => t2['priority'] - t1['priority']);
            // Update data file
            Dataworker.update_task_list(data_dir, task_list)
        }

        return task_list
    }

    static add_task(data_dir, task) {
        /* Add Task to Data File */
        Dataworker.get_tasks(data_dir).then(task_list => {
            // Update task list
            task_list = [
                ...task_list,
                task,
            ]
            task_list = JSON.stringify(task_list, null, '   ');
            fs.writeFile(data_dir, task_list, "utf8", () => {})
        }).catch(err => {
            // Try again
            Dataworker.add_task(data_dir, task);
        })
    }

    static update_task_list(data_dir, task_list) {
        /* Updating Task List in Data File */
        task_list = JSON.stringify(task_list, null, '   ');
        fs.writeFileSync(data_dir, task_list)
    }

    static take_data_file_dir() {
        /* Get Correct Data File Path */
        let data_file_dir_str = ''
        if (os.platform == 'win32') {
            // Windows support
            let data_file_dir_folders = __dirname.split('\\').slice(0, __dirname.split('\\').length - 1);
            data_file_dir_str = (data_file_dir_folders[0]+'\\');
            data_file_dir_folders = data_file_dir_folders.slice(1);
            data_file_dir_str = data_file_dir_str + data_file_dir_folders.join('\\') + '\\data\\data_file.json';

        } else {
            // Unix like systems support
            let data_file_dir_folders = __dirname.split('/').slice(0, __dirname.split('/').length - 1);
            data_file_dir_str = data_file_dir_str + data_file_dir_folders.join('/') + '/data/data_file.json';
        }
        return data_file_dir_str;
    }
}

module.exports = Dataworker;
