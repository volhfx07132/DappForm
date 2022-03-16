pragma solidity >=0.4.0 <0.9.0;
contract ChangeName{
    struct Student{
        string fullName;
        string deccription;
        uint age;
        string university;
        address addressStudent;
    }
    address public admin; 
    address[] public totalAddressResgiter;
    mapping(address =>Student) public students;
    event LogAddDataStudent(address indexed _address, string _fullName, uint _age, string _university);
    
    constructor(){
      admin = msg.sender;
    }
    
    modifier onlyAdmin(){
      require(admin == msg.sender, "Only admin can solve");
      _;
    }

    function getTotalAccountOfStudent() public view returns(address[] memory){
        return totalAddressResgiter;
    }

    function adminAddData(address _address, string memory _fullName, string memory _deccription, uint _age, string memory _university) public onlyAdmin{
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
            students[_address].deccription = _deccription;
            students[_address].age = _age;
            students[_address].university = _university;
            students[_address].addressStudent = _address;
            totalAddressResgiter.push(_address);
            emit LogAddDataStudent(_address, _fullName, _age, _university);
        }else{
            revert("This address areally existed");
        }
        
    }

    function studentAddData(string memory _fullName, string memory _deccription, uint _age, string memory _university) public{
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
            students[msg.sender].deccription = _deccription;
            students[msg.sender].age = _age;
            students[msg.sender].university = _university;
            totalAddressResgiter.push(msg.sender);
            students[msg.sender].addressStudent = msg.sender;
            emit LogAddDataStudent(msg.sender, _fullName, _age,_university);
        }else{
            revert("This address areally existed");
        } 
    }

    function deleteInformationOfStudent(address _address) public {
        if(_address == admin || _address == msg.sender){
            for(uint i = 0 ; i < totalAddressResgiter.length ; i++){
                if(totalAddressResgiter[i] == _address){
                    totalAddressResgiter[i] = 0x0000000000000000000000000000000000000000;
                    students[_address].fullName = "";
                    students[_address].deccription = "";
                    students[_address].age = 0;
                    students[_address].university = "";
                    students[_address].addressStudent = 0x0000000000000000000000000000000000000000;
                }
            }
        }     
    }

    function updateInformation(address _address, string memory _fullName, string memory _deccription, uint _age, string memory _university) public {
        if(_address == admin || _address == msg.sender){
            students[_address].fullName = _fullName;
            students[_address].deccription = _deccription;
            students[_address].age = _age;
            students[_address].university = _university;
        }
    }

}    