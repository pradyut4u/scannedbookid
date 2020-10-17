import React from 'react';
import { Text,
        View,
        TouchableOpacity,
        TextInput,
        Image,
        StyleSheet,
        Alert,
        KeyboardAvoidingView,
        ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../Config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    handleTransaction=async()=>{
    var transactionMessage
    db.collection("books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
        console.log(doc.data())
        console.log("handleTransaction" + doc.data())
        var book = doc.data()
        if(doc.data().bookAvailaibility === true){
            this.initiatBookIssue()
            transactionMessage = "Book Issue"
            //ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
            Alert.alert(transactionMessage)
        }
        else{
            this.initiatBookReturn()
            transactionMessage = "Book Return"
            //ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
            Alert.alert(transactionMessage)
        }
    })
    this.setState({transactionMessage:transactionMessage})
    }

    initiatBookIssue=async()=>{
        db.collection("transaction").add({
        'studentid': "s001",
        'bookid': this.state.scannedBookId,
        'transactionType': "issue",
        'transactionDate': firebase.firestore.Timestamp.now().toDate(),
        'transactionid':2
        })
        db.collection("books").doc("bsc001").update({
            'bookAvailaibility': false
        })
        db.collection("students").doc("s001").update({
            'bookno':firebase.firestore.FieldValue.increment(1)
        })
    }

    initiatBookReturn=async()=>{
        db.collection("transaction").add({
        'studentid': "s001",
        'bookid': this.state.scannedBookId,
        'transactionType': "return",
        'transactionDate': firebase.firestore.Timestamp.now().toDate(),
        'transactionid': 3
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailaibility': true
        })
        db.collection("students").doc("s001").update({
            'bookno':firebase.firestore.FieldValue.increment(-1)
        })
    }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="paddng" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({
                    scannedBookId:text
              })}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({
                    scannedStudentId:"s001"
              })}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={async()=>{
            this.handleTransaction()
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
            }}>
            <Text>SUBMIT</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
    backgroundColor: '#69a85b',
      width: 70,
      borderWidth: 1.5,
      borderLeftWidth: 0,
      justifyContent:'center',
      alignItems:'center'
    }
  });