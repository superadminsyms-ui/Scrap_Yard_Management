 package com.scrapyard.management.config;                                                                                                                          
                                                                                                                                                                                    
     import org.springframework.context.annotation.Configuration;                                                                                                              
     import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;                                                                             
     import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;                                                                                                     
                                                                                                                                                                                    
     @Configuration                                                                                                                                                                 
     public class SpaWebConfig implements WebMvcConfigurer {                                                                                                                        
                                                                                                                                                                                    
         @Override                                                                                                                                                                  
         public void addViewControllers(ViewControllerRegistry registry) {                                                                                                          
             registry.addViewController("/login").setViewName("forward:/index.html");                                                                                               
             registry.addViewController("/forgot-password").setViewName("forward:/index.html");                                                                                     
             registry.addViewController("/reset-password").setViewName("forward:/index.html");                                                                                      
             registry.addViewController("/change-password").setViewName("forward:/index.html");                                                                                     
             registry.addViewController("/app").setViewName("forward:/index.html");                                                                                                 
             registry.addViewController("/app/**").setViewName("forward:/index.html");                                                                                              
         }                                                                                                                                                                          
     }  
