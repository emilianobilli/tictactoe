pragma solidity ^0.4.19;

contract TicTacToe
{
    // Condicion impuesta por mi 
    // Solamente 1 juego a la vez
    
    struct Game {
        string name;
        address[9] board;
        address[2] player;
        uint turn;
        uint amount;
        bool waiting;
        bool finish;
    }
    Game room;
    
    function TicTacToe() public
    {
        room.finish = true;
    }
    
    
    modifier waiting()
    {
        require(room.waiting == true);
        _;
    }
    
    modifier otherPlayer()
    {
        require(room.player[0] != msg.sender);
        _;
    }
    
    modifier checkBid()
    {
        require(room.amount <= msg.value);
        _;
    }
    
    modifier myTurn()
    {
        require(room.player[room.turn] == msg.sender);
        _;
    
    }
    
    modifier playable(uint c)
    {
        require(room.board[c] == 0);
        _;
    }
    
    modifier notOpen()
    {
        require(room.finish == true);
        _;
    }
    
    function nextTurn() internal
    {
        if (room.turn == 0) 
            room.turn = 1;
        else 
            room.turn = 0;
    }
    
    function checkBoard(uint c) constant internal returns (bool)
    {
        address[9] memory board = room.board;
        if (c == 0) 
        {
            if ((board[0] == board[4]  && board[0] == board[8]) ||
                (board[0] == board[1]  && board[0] == board[2]) ||
                (board[0] == board[3]  && board[0] == board[6])) 
            { 
                return true; 
            }
            else
            {
                return false;
            }
        } 
        else if (c== 1)
        {
            if ((board[1] == board[0] && board[1] == board[2])||
                (board[1] == board[4] && board[1] == board[7]))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else if (c == 2)
        {
            if ((board[2] == board[0] && board[2] == board[1])||
                (board[2] == board[4] && board[2] == board[6])||
                (board[2] == board[5] && board[2] == board[8]))
            {
                return true;
            }
            else 
            {
                return false;
            }
        }
        else if (c == 3) 
        {
            if ((board[3] == board[0] && board[3] == board[6])||
                (board[3] == board[4] && board[3] == board[5]))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else if (c == 4)
        {
            if ((board[3] == board[4] && board[4] == board[5])||
                (board[2] == board[4] && board[4] == board[6])||
                (board[1] == board[4] && board[4] == board[7])||
                (board[0] == board[4] && board[4] == board[8]))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else if (c == 5)
        {
            if ((board[3] == board[5] && board[4] == board[5])||
                (board[2] == board[5] && board[8] == board[5]))
            {
                return true;
            }
            else 
            {
                return false;
            }
        }
        else if (c == 6)
        {
            return true;
        }
        else if (c == 7)
        {
            return true;
        }
        else if (c == 8)
        {
            return true;
        }
    }
    function getBoard() constant public returns(address[9])
    {
        return room.board;
    }
    function getTurn() constant public returns(address)
    {
        if (room.waiting == true)
        {
            return address(0);
        }
        return room.player[room.turn];
    }
    function newGame(string room_name) notOpen() public payable
    {
        room.name       = room_name;
        room.player[0]  = msg.sender;
        room.turn       = 0;
        room.amount     = msg.value;
        room.waiting    = true;
        room.finish     = false;
    }
    
    function joinGame() public payable waiting() otherPlayer() checkBid() returns(bool)
    {
        if (msg.value > room.amount)
            msg.sender.transfer(msg.value-room.amount);
        room.amount    = this.balance;
        room.player[1] = msg.sender;
        room.waiting   = false;
    }
    
    function play(uint c) public playable(c) myTurn() 
    {
        room.board[c] = msg.sender;
        if (checkBoard(c)) {
            room.finish = true;
            msg.sender.transfer(room.amount);
        }
        else
            nextTurn();
    }
}