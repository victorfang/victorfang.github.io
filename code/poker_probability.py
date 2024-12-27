# -*- coding: utf-8 -*-
"""
Poker Probability Simulation
Victor Fang, 2024-12-26

This Python script simulates dealing cards from two decks to four players and calculates
the probability of getting four, five, six, seven, or eight of a kind in a player's hand. 
"Fight the Landlord"is a game of poker with two decks of cards.

Functions:
- create_double_deck: Creates a double deck of cards (108 cards total including 4 jokers).
- deal_cards: Shuffles and deals all cards to players.
- has_n_of_a_kind: Checks if a hand has n cards of the same number.
- run_simulation: Runs multiple simulations and calculates probabilities.
- main: Executes the simulation and prints the results.

Usage:
Run this script to see the probability of getting n of a kind in a poker hand
when dealing from two decks to four players.

Example output:
Simulation Results (over 10,000 games):
Probability of any player getting 4 of a kind: 99.8100%
Odds: 1 in 1
Probability of any player getting 5 of a kind: 70.4400%
Odds: 1 in 1
Probability of any player getting 6 of a kind: 14.0200%
Odds: 1 in 7
Probability of any player getting 7 of a kind: 1.0500%
Odds: 1 in 95
Probability of any player getting 8 of a kind: 0.0300%
Odds: 1 in 3,333

Example Deal:
Player 1: 2♣ 2♠ 3♠ 3♦ 4♠ 4♣ 5♣ 6♣ 6♥ 7♥ 7♣ 7♦ 8♦ 8♠ 9♠ 9♦ 10♣ J♠ J♦ J♦ *Q♣* *Q♦* *Q♥* *Q♣* K♠ A♠ JokerBlack
Player 2: 2♥ 2♠ 3♥ 3♣ 3♠ 4♠ 5♣ 5♠ 5♥ 6♠ 8♦ 8♣ *10♠* *10♣* *10♦* *10♦* *10♥* *J♣* *J♥* *J♠* *J♥* Q♠ Q♦ K♣ A♦ A♣ JokerBlack
Player 3: 2♦ 2♣ 3♥ *4♥* *4♣* *4♦* *4♥* 5♥ 5♦ 5♠ 6♦ 6♣ 7♣ *8♥* *8♥* *8♣* *8♠* 9♦ 9♣ 9♥ J♣ K♠ *A♣* *A♠* *A♦* *A♥* JokerRed
Player 4: 2♦ 2♥ 3♦ 3♣ 4♦ 5♦ 6♥ 6♠ 6♦ *7♠* *7♠* *7♥* *7♦* 9♠ 9♣ 9♥ 10♥ 10♠ Q♥ Q♠ *K♦* *K♥* *K♥* *K♦* *K♣* A♥ JokerRed
"""

import random
from collections import Counter

def create_double_deck():
    """Create 2 decks of cards (108 cards total including 4 jokers)"""
    suits = ['♠', '♣', '♥', '♦']
    numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    deck = [(num, suit) for num in numbers for suit in suits] * 2
    jokers = [('Joker', 'Black'), ('Joker', 'Red')] * 2  # Adding four jokers
    deck.extend(jokers)
    return deck

def deal_cards(deck, num_players=4):
    """Deal all cards to players"""
    random.shuffle(deck)
    cards_per_player = len(deck) // num_players
    hands = [deck[i * cards_per_player:(i + 1) * cards_per_player] for i in range(num_players)]
    return hands

def has_n_of_a_kind(hand, n):
    """Check if a hand has n cards of the same number"""
    numbers = [card[0] for card in hand]
    return max(Counter(numbers).values()) >= n

def run_simulation(num_simulations=100000):
    """Run multiple simulations and calculate probabilities"""
    results = {
        4: 0,  # Four of a kind
        5: 0,  # Five of a kind
        6: 0,  # Six of a kind
        7: 0,  # Seven of a kind
        8: 0   # Eight of a kind
    }
    
    for _ in range(num_simulations):
        deck = create_double_deck()
        hands = deal_cards(deck)
        
        for n in results.keys():
            if any(has_n_of_a_kind(hand, n) for hand in hands):
                results[n] += 1
    
    probabilities = {n: count / num_simulations for n, count in results.items()}
    return probabilities

def main():
    num_simulations = 10000
    probabilities = run_simulation(num_simulations)
    
    print("Simulation Results (over {:,} games):".format(num_simulations))
    for n, probability in probabilities.items():
        print(f"Probability of any player getting {n} of a kind: {probability:.4%}")
        if probability > 0:
            print(f"Odds: 1 in {int(1/probability):,}")
    
    # Example hand visualization
    deck = create_double_deck()
    hands = deal_cards(deck)
    print("\nExample Deal:")
    
    # Define the order of card numbers for sorting
    number_order = {str(i): i for i in range(2, 11)}
    number_order.update({'J': 11, 'Q': 12, 'K': 13, 'A': 14, 'Joker': 15})
    
    for i, hand in enumerate(hands, 1):
        # Sort the hand by card numbers
        sorted_hand = sorted(hand, key=lambda card: number_order[card[0]])
        
        # Count occurrences of each number
        number_counts = Counter(card[0] for card in sorted_hand)
        
        # Highlight four of a kind
        highlighted_hand = [
            f"*{num}{suit}*" if number_counts[num] >= 4 else f"{num}{suit}"
            for num, suit in sorted_hand
        ]
        
        cards = ' '.join(highlighted_hand)
        print(f"Player {i}: {cards}")

if __name__ == "__main__":
    main() 
