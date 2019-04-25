import React, {Component} from 'react';
import List from './List';
import PropTypes from 'prop-types';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

//DnD: Container
class KanbanBoard extends Component {

    render() {
        const {cards, taskCallbacks, cardCallbacks} = this.props;

        return (
            <div className="app">
                <List id='todo'
                      title="To Do"
                      cards={cards.filter((card) => card.status === "todo")}
                      taskCallbacks={taskCallbacks}
                      cardCallbacks={cardCallbacks}
                />
                <List id='in-progress'
                      title="In Progress"
                      cards={cards.filter((card) => card.status === "in-progress")}
                      taskCallbacks={taskCallbacks}
                      cardCallbacks={cardCallbacks}
                />
                <List id='done'
                      title='Done'
                      cards={cards.filter((card) => card.status === "done")}
                      taskCallbacks={taskCallbacks}
                      cardCallbacks={cardCallbacks}
                />
            </div>
        );
    }
}

KanbanBoard.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallbacks: PropTypes.object
};


export default DragDropContext(HTML5Backend)(KanbanBoard);
