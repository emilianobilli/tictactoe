pragma solidity ^0.4.19;

contract Test 
{
    struct Game {
        address[9] board;
        address[2] player;
        uint turn;
        uint amount;
        bool open;
    }

    mapping(string => Game ) game;
    string[] game_list;
    
    modifier notExistGame(string _id) 
    {
        require ();
        _;
    }

    function newGame(string _id) notExistGame(_id) payable public returns(bool)
    {
        keys.push(_id);
        game[_id].player[0] = msg.sender;
        game[_id].turn      = 0;
        game[_id].amount    = msg.value;
        game[_id].open      = true;
    }
    
    function getBoard(string _id) public constant returns(address[9])
    {
        return game[_id].board;
    }
    
    function getTurn(string _id) public constant returns(address)
    {
        return game[_id].player[game[_id].turn];
    }
    
    modifier gameOpen(string _id)
    {
        require (game[_id].open == true);
        _;
    }
    
    modifier notStartedGame(string _id)
    {
        require (game[_id].player[1] == 0 && game[_id].player[0] != msg.sender);
        _;
    }
    
    function join(string _id) notStartedGame(_id) public returns(bool)
    {
        game[_id].player[1] = msg.sender;
        game[_id].open      = false;
        return true;
    }
    
    function checkBoard(string _id, uint c) internal returns (bool)
    {
        address[9] memory board = game[_id].board;
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
    
    modifier playable(string _id, uint c)
    {
        require(game[_id].board[c] == 0);
        _;
    }
    
    modifier valid_turn(string _id)
    {
        require(game[_id].player[game[_id].turn] == msg.sender);
        _;
        
    }
    
    function nextTurn(string _id) internal
    {
        if (game[_id].turn == 0) 
            game[_id].turn = 1;
        else 
            game[_id].turn = 0;
    }
    
//    function play(uint c, string _id) valid_turn(_id) playable public returns(bool)
 //   {
        //bool w;
        //board[c] = msg.sender;
        //w = checkBoard(c);
        //if (!w) {
        //   nextTurn();            
        //}
  //  }
}