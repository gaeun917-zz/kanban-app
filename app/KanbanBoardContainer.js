import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'babel-polyfill'
import {throttle} from './utils';

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
        this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
        this.updateCardPosition = throttle(this.updateCardPosition.bind(this), 500);
    }

    // fetch data on componentDidMount
    // pattern:.fetch(api, header).then((res)=> res.json).then((resData)=> this.setState({cards: resData}))
    componentDidMount() {
        fetch(API_URL + '/cards', {
            headers: API_HEADERS
        }).then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    cards: responseData
                });
            }).catch((error) => {
            console.log('Error fetching and parsing data', error);
        });
    }

    // 1.addTask-post/$push,
    // 2.deleteTask-$splice,
    // 3.toggleTask-post
    // 4.update card status
    // 5.update card position
    // 6.persistCardDrag
    // 7.updateCard
    // 8.addCard

    addTask(cardId, taskName) {
        const {cards} = this.state;
        let prevState = this.state;
        // which card it is added on: Find the index of the card
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        // for db update: Create a new task with the given name and a temporary ID
        let newTask = {
            id: Date.now(),
            name: taskName,
            done: false
        };
        // on State, Create a new object and push it to the array of tasks
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
        }).then((resp) => {
            if (resp.ok) {
                return resp.json()
            } else {
                throw new Error("Server response wasn't OK")
            }
        }).then((respData) => {
            // When the server returns the definitive ID used for the new Task on the server, update it on React
            newTask.id = respData.id;
            this.setState({
                cards: nextState
            });
        }).catch((error) => {
            this.setState(prevState);
        });
    }

    deleteTask(cardId, taskId, taskIndex) {
        const {cards} = this.state;
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
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Server response wasn't OK")
            }
        }).catch((error) => {
            console.error("Fetch error:", error);
            this.setState(prevState);
        });
    }

    toggleTask(cardId, taskId, taskIndex) {
        const {cards} = this.state;
        let prevState = this.state;
        let cardIndex = cards.findIndex((card) => card.id == cardId);
        // Save a reference to the task's 'done' value
        let newDoneValue;
        // Using the $apply command
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
            let card = cards[cardIndex];
            let afterIndex = cards.findIndex((card) => card.id == afterId);
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

    //used on Card
    persistCardDrag(cardId, status) {
        // Find the index of the card
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        // Get the current card
        let card = this.state.cards[cardIndex]

        fetch(`${API_URL}/cards/${cardId}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({status: card.status, row_order_position: cardIndex})
        }).then((response) => {
            if (!response.ok) {
                // Throw an error if server response wasn't 'ok'
                // so we can revert back the optimistic changes
                // made to the UI.
                throw new Error("Server response wasn't OK")
            }
        }).catch((error) => {
            console.error("Fetch error:", error);
            this.setState(
                update(this.state, {
                    cards: {
                        [cardIndex]: {
                            status: {$set: status}
                        }
                    }
                })
            );
        });
    }

    updateCard(card) {
        const {cards} = this.state;
        let prevState = this.state;
        let cardIndex = cards.findIndex((c) => c.id == card.id);
        let nextState = update(cards, {
            [cardIndex]: {$set: card}
        });
        this.setState({
            cards: nextState
        });
        fetch(`${API_URL}/cards/${card.id}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        }).then((resp) => {
            if (!resp.ok) {
                throw new Error('server response was failed')
            }
        }).catch((err) => {
            console.log('fetch error', err);
            this.setState(prevState)
        })
    }

    addCard(card) {
        const {cards} = this.state;
        let prevState = this.state;
        // Add a temporary ID to the card
        if (card.id === null) {
            let card = Object.assign({}, card, {
                id: Date.now()
            });
        }
        let nextState = update(cards, {
            $push: [card]
        });
        this.setState({
            cards: nextState
        });
        fetch(`${API_URL}/cards`, {
            method: 'post',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error("Server response wasn't OK")
            }
        }).then((responseData) => {
            card.id = responseData.id;
            this.setState({
                cards: nextState
            });
        }).catch((error) => {
            this.setState(prevState);
        });
    }

    render() {
        const {children} = this.props;
        const {cards} = this.state;

        let kanbanBoard = children && React.cloneElement(children, {
            cards: cards,
            taskCallbacks: {
                toggle: this.toggleTask.bind(this),
                delete: this.deleteTask.bind(this),
                add: this.addTask.bind(this)
            },
            cardCallbacks: {
                addCard: this.addCard.bind(this),
                updateCard: this.updateCard.bind(this),
                updateStatus: this.updateCardStatus,
                updatePosition: this.updateCardPosition,
                persistCardDrag: this.persistCardDrag.bind(this)
            }
        });
        console.log(kanbanBoard, children)
        return kanbanBoard;
    }
}

export default KanbanBoardContainer;
