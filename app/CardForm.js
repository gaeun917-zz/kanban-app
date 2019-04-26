import React, {Component} from 'react';
import PropTypes from 'prop-types';

class CardForm extends Component {

    handleChange(field, e) {
        const {handleChange} = this.props;
        handleChange(field, e.target.value);
    }

    handleClose(e) {
        const {handleClose} = this.props;
        e.preventDefault();
        handleClose();
    }

    render() {
        const {
            handleSubmit,
            draftCard,
            buttonLabel
        } = this.props;

        return (
            <div>
                <div className="card big">
                    <form onSubmit={handleSubmit.bind(this)}>
                        <input type='text'
                               value={draftCard.title}
                               placeholder="Title"
                               required={true}
                               autoFocus={true}
                               onChange={this.handleChange.bind(this, 'title')}
                        /><br />
                        <textarea value={draftCard.description}
                                  placeholder="Description"
                                  required={true}
                                  onChange={this.handleChange.bind(this, 'description')}
                        /><br />
                        <label htmlFor="status">Status</label>
                        <select id="status"
                                value={draftCard.status}
                                onChange={this.handleChange.bind(this, 'status')}>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select><br />
                        <label htmlFor="color">Color</label>
                        <input id="color"
                               value={draftCard.color}
                               type="color"
                               defaultValue="#ff0000"
                               onChange={this.handleChange.bind(this, 'color')}
                        />
                        <div className='actions'>
                            <button type="submit">{buttonLabel}</button>
                        </div>
                    </form>
                </div>
                <div className="overlay"
                     onClick={this.handleClose.bind(this)}/>
            </div>
        );
    }
}

CardForm.propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    draftCard: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        status: PropTypes.string,
        color: PropTypes.string
    }).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default CardForm;