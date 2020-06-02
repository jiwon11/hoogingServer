const nodemailer = require('nodemailer');
const crypto = require('crypto');
// 메일발송 객체
var mailSender = {
	// 메일발송 함수
    sendGmail : function(param){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            prot : 587,
            host :'smtp.gmlail.com',
            secure : false,
            requireTLS : true,
            auth: {
              user: 'hoogingapp@gmail.com',
              pass: 'Dnjsdud1'
            }
        });
        // 메일 옵션
        var url = 'http://' + param.req.get('host')+'/auth'+'/confirmEmail'+'?key='+param.token;
        var mailOptions = {
                from: 'hoogingapp@gmail.com',
                to: param.toEmail, // 수신할 이메일
                subject: '이메일 인증을 진행해주세요.', // 메일 제목
                text: '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>'+url // 메일 내용
            };
        // 메일 발송    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
            smtpTransport.close();
        });
        
    }
};
// 메일객체 exports
module.exports = mailSender;