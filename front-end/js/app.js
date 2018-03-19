var circleImg        = "img/circle.png";
var crossImg         = "img/cross.png";
var contract_address = "contract_address";
var private_key      = "private_key";
var account_balance	 = "account_balance";
var contract_abi     = "contract_abi";
var new_game_name    = "new_game_name";
var new_game_bid     = "new_game_bid";
var join_game_bid    = "join_game_bid";
var node			 = "https://ropsten.infura.io/5xuYYhkXoCzTJ7k23s2B";
/*
 * Global Vars
 */
var inGameFlag		 = false;
var board			 = [];
var myturn			 = false;
var we;
var contract;
var account;
var interval;

var active_screen;

var evtEndGame;   
var	evtNewGame;
var	evtPlayerJoin;
var	evtTurnChange;

/*=======================================================================*
 * Buttons Function  													 *
 *=======================================================================*/
function btn_fcn_import_account () {
	var addr = document.getElementById(contract_address).value;	
	var pkey = document.getElementById(private_key).value;
	var cabi = document.getElementById(contract_abi).value;
	
	if (addr != "" && pkey != "" && cabi != "") {
		
		import_contract(addr,cabi);
		import_account(pkey);
	}
	else {
		/*
		 * TODO: Hay que marcar que valor falta
		 */
	}
	load_game();
}

function btn_fcn_unload_contract() 
{
	localStorage.removeItem("account");
	localStorage.removeItem("tictactoe_contract");
}	
 
function btn_fnc_new_game() 
{
	var name = document.getElementById(new_game_name).value;
	var bid  = document.getElementById(new_game_bid).value;
	newGame_call(name,bid);
}	

function btn_fnc_join_game() 
{
	var bid = document.getElementById(join_game_bid).value;
	joinGame_call(bid);
}	
/*=======================================================================*
 * ids																	 *
 *=======================================================================*/ 
var btn_id_import_account  = "btn_import_account";
var btn_id_unload_contract = "btn_unload_contract";
var btn_id_new_game		   = "btn_new_game"; 
var btn_id_join_game	   = "btn_join_game";
 
function setCross(e)
{
	var i = document.getElementById(e);
	i.src = crossImg;
}

function clear(e)
{
	var i = document.getElementById(e);
	i.src = "";
}

function setCircle(e)
{
	var i = document.getElementById(e);
	i.src = circleImg;
}

function getAddrFromPrivateKey(pkey)
{
    var privateKey = Lib.buffer(pkey, 'hex');
    var ecparams   = Lib.ecurve.getCurveByName('secp256k1');
    var curvePt    = ecparams.G.multiply(Lib.BigInteger.fromBuffer(privateKey));
    var x = curvePt.affineX.toBuffer(32);
    var y = curvePt.affineY.toBuffer(32);
    var publicKey = Lib.buffer.concat([x, y]);
	
	var w = new Lib.web3;
	return "0x" + w.utils.sha3("0x" + publicKey.toString('hex'), { encoding: 'hex' }).substring(26);
}


function start_contract(abi,addr)
{
	we            = new Lib.web3(new Lib.web3.providers.HttpProvider(node));
	contract      = new we.eth.Contract(JSON.parse(abi),addr);
	evtEndGame    = contract.events.EndGame({},{fromBlock: 0, toBlock: 'latest'});    
	evtNewGame    = contract.events.NewGame({},{fromBlock: 0, toBlock: 'latest'});
	evtPlayerJoin = contract.events.PlayerJoin({},{fromBlock: 0, toBlock: 'latest'});
	evtTurnChange = contract.events.TurnChange({},{fromBlock: 0, toBlock: 'latest'});
}


function newGame_call(name,value,callback) 
{
	var f  = contract.methods.newGame(name);
	return method_call(f,we.utils.toWei(value.toString()),callback);
}

function joinGame_call(value,callback)
{
	var f  = contract.methods.joinGame();
	return method_call(f,we.utils.toWei(value.toString()),callback);
}

function play_0() {play_call(0);}
function play_1() {play_call(1);}
function play_2() {play_call(2);}
function play_3() {play_call(3);}
function play_4() {play_call(4);}
function play_5() {play_call(5);}
function play_6() {play_call(6);}
function play_7() {play_call(7);}
function play_8() {play_call(8);}

function false_turn() {myturn = false;}

function play_call(value,callback)
{
	if (myturn && board[value] == "0x0000000000000000000000000000000000000000")
	{
		var f = contract.methods.play(value);
		setCircle(value);
		return method_call(f,"0x0",callback);
	}
}

function inGame(onFalse,onTrue) {
	contract.methods.getPlayers().call(function(error,result){
		if (!error) {
			console.log(result);
			console.log(account.address.toString());
			if (account.address.toLowerCase() == result[0].toLowerCase() || 
			    account.address.toLowerCase() == result[1].toLowerCase()) 
				onTrue();
			else {
				console.log("Puto");
				onFalse();
			}
		}
	});
}

function method_call(f,wei,callback)
{
	var tx = {};
	tx['from']  = account.address;
	tx['to']    = contract._address;
	tx['value'] = we.utils.toHex(wei);
	tx['data']  = f.encodeABI();
	console.log(tx);
	f.estimateGas(tx, function(error,gasLimit) {
		if (!error) {
			tx['gasLimit'] = we.utils.toHex(gasLimit+1);
			dispatch_tx(tx);
		}
		else 
		{
			tx['gasLimit'] = we.utils.toHex(300000);
			dispatch_tx(tx,callback);
		}
	});
}


function dispatch_tx(t,callback) 
{

	we.eth.getTransactionCount(account.address, function(error_nonce,nonce)
	{
		tx = {};
		if (!error_nonce) 
		{
			tx['nonce'] = nonce;
			we.eth.getGasPrice(function(error_get_gas_price,gasPrice) {
				if (!error_get_gas_price) 
				{
					tx['gasPrice'] = we.utils.toHex(gasPrice);
					tx['chainId']  = 3;
					/*
					 * Completar con los demas campos
					 */
					tx['to'] 	   = t['to'];
					tx['value']	   = t['value'];
					tx['data']	   = t['data'];
					tx['gasLimit'] = t['gasLimit'];
					console.log(tx);
					/* 
					 * Firmamos la transaccion
					 */
					pk  = Lib.buffer(account.key,'hex');
					etx = new ethereumjs.Tx(tx);
					etx.sign(pk);
					stx = etx.serialize();
					we.eth.sendSignedTransaction('0x' + stx.toString('hex'),function(error,hash){
						if (!error)
						{
							waitTx(hash);
						}					
					});
				}
			});
		}
	});
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms*1000));
}

async function waitTx(txhash) {
    receipt = await we.eth.getTransactionReceipt(txhash);
	while (!receipt) {
		last_screen = active_screen;
		show_screen('waiting');
		await sleep(5);
		receipt = await we.eth.getTransactionReceipt(txhash);
		show_screen(last_screen);
	}	
}


/**
 * drawboard(): Executa la funcion del contrato getBoard() y lo dibuja
 */
 
function draw_board()
{
	contract.methods.getBoard().call(function(error,result) {
		if (!error) {
			board = result;
			for (i=0; i<= result.length-1; i++) {
				if (account.address.toLowerCase() == result[i].toLowerCase()) {
					/* Circle is self player */
					setCircle(i);
				}
				else {
					if (result[i] != "0x0000000000000000000000000000000000000000") {
						setCross(i);
					}	
				}
			}			
		}
	});	
}



function check_room_free()
{
	contract.methods.roomFree().call(function(error,result) {
		if (!error) {
			console.log(result);
			if (result) 
			{
				/* Show section new Game */
				show_section('section_new_game');
				show_screen('room_selection');
			}
			else 
			{
				contract.methods.isWaiting().call(function(error,result) {
					if (!error) {
						console.log(result);
						if (result)
						{
							contract.methods.getRoomName().call(function(error,name) {
								if (!error) 
								{
									contract.methods.getBid().call(function(error,bid) {
										if (!error) 
										{
											set_room_attr(name,bid);
											show_section('section_join_game');
											show_screen('room_selection');
										}
									});
								}
							});
						}
						else {
							inGame(console.log,
								function () {
									inGameFlag = true;
									draw_board();
									show_screen('board');
									inteval = window.setInterval(function () {
										contract.methods.getTurn().call(function(e,turn) {
											if (turn.toLowerCase() == account.address.toLowerCase()) 
											{
												myturn = true;
												draw_board();
											}
											else {
												myturn = false;
											}
										});
									}, 2000);
								}
							);
						}						
							
					}
				});
			}
		}
	});
}

function set_btn_handler(btn_id,fcn)
{
	try {
		document.getElementById(btn_id).addEventListener("click",fcn);
	}
	catch (err) {
		window.alert(err);
	}
}

function set_room_attr(name,bid)
{
	document.getElementById("join_game_name").innerHTML = name;
	document.getElementById("join_game_bid").value  = we.utils.fromWei(bid);
}
	

/*
 * Hace la importacion de una cuenta
 */
function import_account(key)
{
	account = {'address': getAddrFromPrivateKey(key),
			   'key': key };
	localStorage.setItem("account",JSON.stringify(account));
}
/*
 * Hace la importacion del contrato
 */
function import_contract(address, abi)
{
	/* Armamos un objeto para guardar la estructura en localStorage */
	contract = {'address': address,
				'abi': abi};
	localStorage.setItem("tictactoe_contract", JSON.stringify(contract));
	return JSON.stringify(contract);
}

function show_screen(screen_name)
{
	screen = ['import_account',
			  'room_selection',
			  'board',
			  'waiting'];
		  
	active_screen = screen_name;			
			  
	for ( i = 0; i <= screen.length-1; i++ )
	{
		if (screen[i] == screen_name )
			document.getElementById(screen[i]).style.display = "block";
		else	
			document.getElementById(screen[i]).style.display = "none";
	}
}

function show_section(section_name)
{
	section = ['section_new_game', 'section_join_game'];	

	for ( i = 0; i <= section.length-1; i++ )
	{
		if (section[i] == section_name )
			document.getElementById(section[i]).style.display = "block";
		else	
			document.getElementById(section[i]).style.display = "none";
	}
}

function load_balance()
{
	we.eth.getBalance(account.address, function(error,result){
		if (!error)
			document.getElementById(account_balance).innerHTML = we.utils.fromWei(result);
	});
}

function load_game() 
{
	var a = localStorage.getItem("account");
	var c = localStorage.getItem("tictactoe_contract");

	if (a && c) 
	{
		co = JSON.parse(c);
		start_contract(co.abi,co.address);
		account = JSON.parse(a);
		/* 
		   Lo proximo que hay que hacer es chequear en que estado esta la sala
		   1- Puede estar libre
		   2- Puede estar esperando jugador
		   3- Puede estar en play
		 */
		load_balance(); 
		check_room_free();
		
	}
	else 
	{
		if (a)
			localStorage.removeItem("account");
		if (c)
			localStorage.removeItem("tictactoe_contract");
	
		/* Hay que mostrar la importacion de datos y salir */
		show_screen('import_account');
	}
}

window.onload = function() {
	document.getElementById("board_0").addEventListener("click", play_0); 
	document.getElementById("board_1").addEventListener("click", play_1);
	document.getElementById("board_2").addEventListener("click", play_2);
	document.getElementById("board_3").addEventListener("click", play_3);
	document.getElementById("board_4").addEventListener("click", play_4);
	document.getElementById("board_5").addEventListener("click", play_5);
	document.getElementById("board_6").addEventListener("click", play_6);
	document.getElementById("board_7").addEventListener("click", play_7);
	document.getElementById("board_8").addEventListener("click", play_8);
	
	set_btn_handler(btn_id_import_account,btn_fcn_import_account);
	set_btn_handler(btn_id_unload_contract,btn_fcn_unload_contract);
	set_btn_handler(btn_id_new_game,btn_fnc_new_game);
	set_btn_handler(btn_id_join_game,btn_fnc_join_game);
	load_game(); 
}