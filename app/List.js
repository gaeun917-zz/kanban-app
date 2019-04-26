import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd'
import Card from './Card';

const targetSpec={
    hover(props, monitor){
        const draggedId = monitor.getItem().id;
        props.cardCallbacks.updateStatus(draggedId, props.id)
    }
}

const targetCollect =(connect, monitor)=>{
    return{
        connectDropTarget: connect.dropTarget()
    }
}

// DnD: DragTarget
class List extends Component {
    render() {
        const {
            cards,
            title,
            taskCallbacks,
            cardCallbacks,
            connectDropTarget
        } = this.props;

        let cardList = cards.map((card) => {
            return <Card key={card.id}
                         taskCallbacks={taskCallbacks}
                         cardCallbacks={cardCallbacks}
                         {...card} />
        });

        return connectDropTarget(
            <div className="list">
                <h1>{title}</h1>
                {cardList}
            </div>
        );
    }
}

List.propTypes = {
    title: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallbacks: PropTypes.object,
    connectDropTarget: PropTypes.func.isRequired
};

export default DropTarget('card', targetSpec, targetCollect)(List);