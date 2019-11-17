import org.gradle.api.Plugin
import org.gradle.api.Project

class AmplifyTools implements Plugin<Project> {
    static class AmplifyToolsPluginExtension {
        // push is set to true by default since we have an explicit task for push
        Boolean push = true
    }

    void apply(Project project) {
        def amplifyExtension = project.extensions.create('amplify', AmplifyToolsPluginExtension)
        def doesNodeExist = false

        def profile = 'default'
        def accessKeyId = null
        def secretAccessKey = null
        def region = null
        def envName = null

        project.task('verifyNode') {
            try {
                project.exec {
                    commandLine 'which', 'node'
                    standardOutput = new ByteArrayOutputStream()
                }
            } catch (e) {
                doesNodeExist = false
                println("Node is not installed. Visit https://nodejs.org/en/download/ to install it")
            }
            doesNodeExist = true
        }

        project.task('createAmplifyApp') {
            def doesGradleConfigExist = project.file('./amplify-gradle-config.json').exists()
            if (doesNodeExist && !doesGradleConfigExist) {
                project.exec {
                    commandLine 'npx', 'amplify-app@canary', '--platform', 'android'
                }
            }
        }

        project.task('getConfig') {
            def inputConfigFile = project.file('./amplify-gradle-config.json')
            def configText = inputConfigFile.text
            def jsonSlurper = new groovy.json.JsonSlurper();
            def configJson = jsonSlurper.parseText(configText)
            profile = configJson.profile
            accessKeyId = configJson.accessKeyId
            secretAccessKey = configJson.secretAccessKeyId
            region = configJson.region
            envName = configJson.envName
        }

        project.task('modelgen') {
            doLast {
                project.exec {
                    commandLine 'amplify', 'codegen', 'model'
                }
            }
        }

        project.task('amplifyPush') {
            def AWSCLOUDFORMATIONCONFIG
            if (!accessKeyId || !secretAccessKey || !region) {
                AWSCLOUDFORMATIONCONFIG = """{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"$profile\"\
}"""
            } else {
                AWSCLOUDFORMATIONCONFIG = """{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"$profile\",\
\"accessKeyId\":\"$accessKeyId\",\
\"secretAccessKey\":\"$secretAccessKey\",\
\"region\":\"$region\"\
}"""
            }

            def AMPLIFY
            if (!envName) {
                AMPLIFY = """{\
\"envName\":\"amplify\"\
}"""
            } else {
                AMPLIFY = """{\
\"envName\":\"$envName\"\
}"""
            }

            def PROVIDERS = """{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"""

            doLast {
                if (amplifyExtension.push) {
                    def doesLocalEnvExist = project.file('./amplify/.config/local-env-info.json').exists()
                    if (doesLocalEnvExist) {
                        project.exec {
                            commandLine 'amplify', 'push', '--yes'
                        }
                    } else {
                        project.exec {
                            commandLine 'amplify', 'init', '--amplify', AMPLIFY, '--providers', PROVIDERS, '--yes'
                        }
                    }
                } else {
                    println('Amplify push set to false')
                }
            }
        }
        project.createAmplifyApp.mustRunAfter('verifyNode')
        project.getConfig.mustRunAfter('createAmplifyApp')
        project.modelgen.mustRunAfter('getConfig')
        project.amplifyPush.mustRunAfter('getConfig')
    }
}