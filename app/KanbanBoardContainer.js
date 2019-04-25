import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'babel-polyfill'

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'StellaAuth'
};

class KanbanBoardContainer extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            cards: [],
        };
    }

    // fetch data on componentDidMount
    //.fetch(api, header).then((res)=> res.json).then((resData)=> this.setState({cards: resData}))
    componentDidMount() {
        fetch(API_URL + '/cards', {headers: API_HEADERS})
            .then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    cards: responseData
                });
            })
            .catch((error) => {
                console.log('Error fetching and parsing data', error);
            });
    }


    //1.add-post/$push,
    // 2.delete-$splice,
    // 3.toggle-post
    //4. update card status


    addTask(cardId, taskName) {
       const {cards} = this.state

        // Rollback: in case of error, Keep a reference to the original state prior to
        let prevState = this.state;
        // which card it is added on: Find the index of the card
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        // for db update: Create a new task with the given name and a temporary ID
        let newTask = {
            id: Date.now(),
            name: taskName,
            done: false
        };
        // on State, Create a new object and push the new task to the array of tasks
        let nextState = update(cards, {
            [cardIndex]: {
                tasks: {$push: [newTask]}
            }
        });
        this.setState({
            cards: nextState
        });


        // Call the API to add the task on the server
        fetch(`${API_URL}/cards/${cardId}/tasks`, {
            method: 'post',
            headers: API_HEADERS,
            body: JSON.stringify(newTask)
        })
            .then((resp) => {
                if (resp.ok) {
                    return resp.json()
                } else {
                    throw new Error("Server response wasn't OK")
                }
            })
            .then((respData) => {
                // When the server returns the definitive ID
                // used for the new Task on the server, update it on React
                newTask.id = respData.id;
                this.setState({
                    cards: nextState
                });
            })
            .catch((error) => {
                this.setState(prevState);
            });
    }

    deleteTask(cardId, taskId, taskIndex) {
        const {cards} = this.state
        let prevState = this.state;
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        let nextState = update(cards, {
            [cardIndex]: {
                tasks: {$splice: [[taskIndex, 1]]}
            }
        });
        this.setState({
            cards: nextState
        });

        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'delete',
            headers: API_HEADERS
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Server response wasn't OK")
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error)
                this.setState(prevState);
            });
    }


    toggleTask(cardId, taskId, taskIndex) {
        const {cards} = this.state
        let prevState = this.state;
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        // Save a reference to the task's 'done' value
        let newDoneValue;
        // Using the $apply command, we will change the done value to its opposite
        let nextState = update(cards, {
                [cardIndex]: {
                    tasks: {
                        [taskIndex]: {
                            done: {
                                $apply: (done) => {
                                    newDoneValue = !done;
                                    return newDoneValue;
                                }
                            }
                        }
                    }
                }
            });
        this.setState({
            cards: nextState
        });

        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({
                done: newDoneValue
            })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Server response wasn't OK")
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error)
                this.setState(prevState);
            });
    }

    updateCardStatus(cardId, listId) {
        const {cards} = this.state;
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        // Get the current card
        let card = cards[cardIndex];
        // Only proceed if hovering over a different list
        if (card.status !== listId) {
            // set the component state to the mutated object
            this.setState(update(this.state, {
                cards: {
                    [cardIndex]: {
                        status: {$set: listId}
                    }
                }
            }));
        }
    }


    updateCardPosition(cardId, afterId) {
        const {cards} = this.state;
        // Only proceed if hovering over a different card
        if (cardId !== afterId) {
            let cardIndex = cards.findIndex((card) => card.id == cardId);
            let afterIndex = cards.findIndex((card) => card.id == afterId);

            // Get the current card
            let card = cards[cardIndex];
            // Find the index of the card the user is hovering over
            // Use splice to remove the card and reinsert it a the new index
            this.setState(update(this.state, {
                cards: {
                    $splice: [
                        [cardIndex, 1],
                        [afterIndex, 0, card]
                    ]
                }
            }));
        }
    }

    render() {
        return (
            <KanbanBoard cards={this.state.cards}
                         taskCallbacks={{
                             toggle: this.toggleTask.bind(this),
                             delete: this.deleteTask.bind(this),
                             add: this.addTask.bind(this)
                         }}
                         cardCallbacks={{
                             updateStatus: this.updateCardStatus.bind(this),
                             updatePosition: this.updateCardPosition.bind(this)
                         }}
            />
        )
    }
}

export default KanbanBoardContainer;
