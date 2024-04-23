Bitcoin has smart contract which is the composition of script in the transaction we methioned in last sections. The script is a kind of executable instructions like assembly language.
But is has its own specilities. It is stack-based, and it can't have loop, in each instruction of bitcoin script, it can only has one operand, and all data that in the running of the
script should be put in the stack.

Bitcoin script is used to run some process to unlock the fund in transaction or verify you are the right recipient of the fund. Just like when you deposite your money in to your bank
account, There are two kinds of instruction in bitcoin script, one is called elements and the other is operations. Elements are used to push data onto the stack, and operations are used
to pop data from stack, do some computation and push the result on the stack. For example instrution OP_DUP is used to copy the data on the top of stack and push the same result on the 
stack. If the there is a value X on the top of stack, and after the execution of OP_DUP then there are two elements with value X on the top of stack.



