import React, {Component} from 'react';
import PropTypes from 'prop-types';

class CheckList extends Component {
    checkInputKeyPress(evt) {
        const {cardId, taskCallbacks} = this.props;
        if (evt.key === 'Enter') {
            taskCallbacks.add(cardId, evt.target.value);
            evt.target.value = '';
        }
    }

    render() {
        const {
            tasks,
            cardId,
            taskCallbacks
        } = this.props;

        let taskList = tasks.map((task, taskIndex) => (
            <li key={task.id}
                className="checklist__task">
                <input type="checkbox"
                       checked={task.done}
                       onChange={taskCallbacks.toggle.bind(null, cardId, task.id, taskIndex)}/>
                {task.name}{' '}
                <a href="#"
                   className="checklist__task--remove"
                   onClick={taskCallbacks.delete.bind(null, cardId, task.id, taskIndex)}/>
            </li>
        ));

        return (
            <div className="checklist">
                <ul>{taskList}</ul>
                <input type="text"
                       className="checklist--add-task"
                       placeholder="Type then hit Enter to add a task"
                       onKeyPress={this.checkInputKeyPress.bind(this)}/>
            </div>
        );
    }
}

CheckList.propTypes = {
    cardId: PropTypes.number,
    tasks: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object
};
export default CheckList;
