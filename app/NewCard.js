import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CardForm from './CardForm'

class NewCard extends Component {

    componentWillMount() {
        this.setState({
            id: Date.now(),
            title: '',
            description: '',
            status: 'todo',
            color: '#c9c9c9',
            tasks: []
        });
    }

    handleChange(field, value) {
        this.setState({
            [field]: value
        });
    }

    handleSubmit(e) {
        const {cardCallbacks, history} = this.props;
        e.preventDefault();
        cardCallbacks.addCard(this.state);
        history.pushState(null, '/');
    }

    handleClose(e) {
        const { history } = this.props;
        history.pushState(null, '/');
    }

    render() {
        return (
            <CardForm draftCard={this.state}
                      buttonLabel="Create Card"
                      handleChange={this.handleChange.bind(this)}
                      handleSubmit={this.handleSubmit.bind(this)}
                      handleClose={this.handleClose.bind(this)}/>
        )
    }
}

NewCard.propTypes = {
    cardCallbacks: PropTypes.object,
};
export default NewCard;