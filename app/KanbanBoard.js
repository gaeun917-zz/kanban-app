import React, {Component} from 'react';
import List from './List';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

//DnD: Container
class KanbanBoard extends Component {

    render() {
        const {
            cards,
            children,
            taskCallbacks,
            cardCallbacks
        } = this.props;

        let cardModal = children && React.cloneElement(children, {
            cards: cards,
            cardCallbacks: cardCallbacks
        });

        return (
            <div className="app">
                <Link to='/new' className='float-button'>+</Link>
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
                {cardModal}
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
