#include <iostream>
#include <GLFW/glfw3.h>
#include <OpenGL/gl3.h> 
#include <OpenGL/glu.h>
#include <glm/glm.hpp>
#include <vector>
#include "parabola.hpp"

using namespace std;
using namespace glm;

int revealCount = 0;
bool animating = false;
double lastAdd = 0.0;
double addInterval = 0.01;

vector<vec3> Parabola_pts;
vector<vec3> generateParabola(const vec3 & b0,const vec3 & b1,const vec3 & b2, int n){

    vector<vec3> pts;
    pts.reserve(n); // 一次擴增 n 個

    for(int i = 0; i <= n; i++){
        //float t = (float)i/n;
        float t = static_cast<float>(rand()) / RAND_MAX;
        float u = 1.0 - t;

        vec3 p= u*u*b0 + 2*t*u*b1 + t*t*b2;
        pts.push_back(p);  
    }
    return pts;
}

void init(){
    int n = 2000;
    vec3 b0 = vec3(-0.5, -0.6,0.0);
    vec3 b1 = vec3(0.0, 2.0, 0.0);
    vec3 b2 = vec3(0.6, -0.7, 0.0);

    Parabola_pts = generateParabola(b0, b1, b2, n);
    revealCount = 0;
    animating = true;
    lastAdd = glfwGetTime();

}

void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods){
    if(action!=GLFW_PRESS) return;
    if(key==GLFW_KEY_SPACE) animating = !animating;
    if(key==GLFW_KEY_R) init();
}
void draw_grid(int size = 10){
    glBegin(GL_LINES);
    glLineWidth(1.0f);
    glColor3f(0.3, 0.3, 0.3);
    for(int i = 1; i< size; i++){
        // 垂直線
        glVertex2f(i, -size);
        glVertex2f(i, size);
        glVertex2f(-i, -size);
        glVertex2f(-i, size);
        // 水平線
        glVertex2f(-size, i);
        glVertex2f(size, i);
        glVertex2f(-size, -i);
        glVertex2f(size, -i);
    }
    glEnd();

    glBegin(GL_LINES);
        glColor3f(1, 0, 0);
        glVertex2f(0, 0);
        glVertex2f(size, 0);
        glColor3f(0.4, 0, 0);
		glVertex2f(0, 0);
		glVertex2f(-size, 0);

        glColor3f(0, 1, 0);
        glVertex2f(0, 0);
        glVertex2f(0, size);
        glColor3f(0, 0.4, 0);
		glVertex2f(0, 0);
		glVertex2f(0, -size);
    glEnd();
}



int main(){
    glfwInit();

    GLFWwindow* window = glfwCreateWindow(800, 600, "拋物線實作", NULL, NULL);
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);
    glEnable(GL_DEPTH_TEST);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    glfwSetKeyCallback(window, key_callback);

     while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
        
        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        glClearColor(0, 0, 0, 0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        if(animating && revealCount < (int)Parabola_pts.size()){
        double now = glfwGetTime();
        if(now - lastAdd >= addInterval){
            revealCount++;
            lastAdd = now;
            }
        }
        // === 畫拋物線 ===
        glColor3f(1.0f, 0.0f, 0.0f);
        glPointSize(5.0f);
        glBegin(GL_POINTS);
        for(int i=0;i<revealCount && i<(int)Parabola_pts.size();++i)
            glVertex2f(Parabola_pts[i].x, Parabola_pts[i].y);
        glEnd();

        glfwSwapBuffers(window);
     }
     glfwTerminate();
}