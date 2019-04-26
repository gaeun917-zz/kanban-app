import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CardForm from './CardForm';

class EditCard extends Component {
    componentWillMount() {
        const {cards, params} = this.props;
        let card = cards.find((card) => card.id == params.card_id);
        this.setState(Object.assign({}, card));
    }

    handleChange(field, value) {
        this.setState({
            [field]: value
        });
    }

    handleSubmit(e) {
        const {history, cardCallbacks } = this.props;
        e.preventDefault();
        cardCallbacks.updateCard(this.state);
        history.pushState(null, '/');
    }

    handleClose(e) {
        const {history} = this.props;
        history.pushState(null, '/');
    }

    render() {
        return (
            <CardForm draftCard={this.state}
                      buttonLabel="Edit Card"
                      handleChange={this.handleChange.bind(this)}
                      handleSubmit={this.handleSubmit.bind(this)}
                      handleClose={this.handleClose.bind(this)}/>
        )
    }
}

EditCard.propTypes = {
    cardCallbacks: PropTypes.object,
}
export default EditCard;