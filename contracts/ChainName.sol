pragma solidity >=0.4.0 <0.9.0;
contract ChangeName{
    struct Student{
        string fullName;
        uint age;
        string university;
    }
    address public admin; 
    address[] public totalAddressResgiter;
    constructor(){
      admin = msg.sender;
    }
    modifier onlyAdmin(){
      require(admin == msg.sender, "Only admin can solve");
      _;
    }
    

    mapping(address =>Student) public students;
    event LogAddDataStudent(address indexed _address, string _fullName, uint _age, string _university);

    function adminAddData(address _address, string memory _fullName, uint _age, string memory _university) public onlyAdmin{
        if(_address == admin){
            revert("Admin account can't to register");
        }
        bool checkStatusAddress = false;
        for(uint i = 0 ; i < totalAddressResgiter.length ; i++){
             if(totalAddressResgiter[i] == _address){
                 checkStatusAddress = true;
                 break;
             }
        }
        if(!checkStatusAddress){
            students[_address].fullName = _fullName;
            students[_address].age = _age;
            students[_address].university = _university;
            totalAddressResgiter.push(_address);
            emit LogAddDataStudent(_address, _fullName, _age, _university);
        }else{
            revert("This address areally existed");
        }
        
    }

    function studentAddData(string memory _fullName, uint _age, string memory _university) public{
        if(msg.sender == admin){
            revert("Admin account can't to register");
        }
        bool checkStatusAddress = false;
        for(uint i = 0 ; i < totalAddressResgiter.length ; i++){
             if(totalAddressResgiter[i] == msg.sender){
                 checkStatusAddress = true;
                 break;
             }
        }

        if(!checkStatusAddress){
            students[msg.sender].fullName = _fullName;
            students[msg.sender].age = _age;
            students[msg.sender].university = _university;
            totalAddressResgiter.push(msg.sender);
            emit LogAddDataStudent(msg.sender, _fullName, _age,_university);
        }else{
            revert("This address areally existed");
        } 
    }
}    