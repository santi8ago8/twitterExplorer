/**
 * Created with JetBrains WebStorm.
 * User: SantiagoPC
 * Date: 25/08/13
 * Time: 13:38
 * To change this template use File | Settings | File Templates.
 */


function TestApp($scope) {
    $scope.count = 1;
    $scope.countLove = 0;
    $scope.countHate = 0;
    $scope.countMiddle = 0;
    $scope.countPass = 0;
    $scope.twitts = [
        {user: {screen_name: 'Test'}, text: 'Text twitt'}
    ];
    var socket = io.connect();
    window.socket = socket;
    socket.on('newTwitt', function (item) {
        $scope.twitts.push(item);
        if (item && !item.limit) {
            $scope.count++;
        }
        if (item.limit) {
            $scope.countPass += item.limit.track;
        }
        else if ((item.text.indexOf('amor') != -1 || item.text.indexOf('love') != -1) &&
            (item.text.indexOf('odio') != -1 || item.text.indexOf('hate') != -1)) {
            $scope.countMiddle++;
        }
        else if (item.text.indexOf('amor') != -1 || item.text.indexOf('love') != -1) {
            $scope.countLove++;
            item.color = 'green';
        }
        else {
            $scope.countHate++;
            item.color = 'red';
        }
        //console.log(item);
        if ($scope.twitts.length > 15)
            $scope.twitts.splice(0, 1);
        $scope.$apply();

    })

}